---
layout: default
title: Module prepend and alias method in Ruby
date: 2022-02-06
parent: Ruby
---

# Module prepend and alias method in Ruby

[Module#prepend](https://ruby-doc.org/core-3.0.1/Module.html#method-i-prepend){:target="_blank"} allows for powerful meta-programming technique to modify a method with option to call original implementation. It's especially useful to wrap functions for tracing purposes like this:

```ruby
class User
  def rank!
    ...
  end
end

User.prepend(Module.new do
  def rank!
    Logger.debug("Calling User#rank!")
    super
  end
end)
```

The same can be achieved with `alias_method` which copy the original method under a new name:

```ruby
User.class_eval do
  alias_method :rank_without_debug!, :rank!
  alias_method :rank!, :rank_with_debug!

  def rank!
    Logger.debug("Calling User#rank!")
    rank_without_debug!
  end
end
```

Unfortunately, when we try to use these two techniques together in a single class, we might end up with a "Stack level too deep" error. It can happen when one of the gems is using `Module#prepend` to override methods instrumented by APM (application performance monitoring) tool (in the past, this caused trouble for some of NewRelic's customers - more info on their [blog](https://newrelic.com/blog/best-practices/ruby-agent-module-prepend-alias-method-chains){:target="_blank"}).

Here is an example for reproducing this case:

```ruby
module RankTracer1
  def self.included(base)
    base.alias_method :rank_without_debug!, :rank!
    base.alias_method :rank!, :rank_with_debug!
  end

  def rank_with_debug!
    Logger.debug("[RankTracer1] User#rank!")
    rank_without_debug!
  end
end

module RankTracer2
  def rank!
    Logger.debug("[RankTracer2] User#rank!")
    super
  end
end

User.prepend(RankTracer2)
User.include(RankTracer1)

User.new.rank!

# [RankTracer2] User#rank!
# [RankTracer1] User#rank!
# [RankTracer2] User#rank!
# [RankTracer1] User#rank!
# ...
# SystemStackError (stack level too deep)
```

When we call `User#rank!`, the code executes in the following order:

1. `RankTracer2#rank!` as it was prepended to `User`'s ancestors chain
2. `RankTracer1#rank_with_debug!` as it was aliased to `rank!` when `RankTracer1` was included in the `User` class
3. `RankTracer#rank!` which calls `RankTracer2#rank!` again as `alias_method :rank_without_debug!, :rank!` was called after `RankTracer2` was already prepended

As shown above, meta-programming is a powerful mechanism but in the wrong hands (or codebase), it might lead to disaster effects.

Sadly, I'm not aware of any other solution than avoiding mixing these two techniques at the same time (this is also what NewRelic did - they moved from `alias_method` to `Module#prepend` for instrumenting `ActiveRecord`calls).
