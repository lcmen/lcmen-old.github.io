---
layout: default
title: Accessing method name and its arguments at runtime in Ruby
date: 2022-01-21
parent: Ruby
---

# Accessing method name and its arguments at runtime in Ruby

Not so long ago, I wanted create a helper function to access current's method (name) and its arguments at runtime for
logging purposes.

To give a more specific example, imagine you have a module to call external API and a few classes relying on it:

```ruby
module SomeApi
  def self.get(url)
    # Some function to call some external API
  end
end

class Accounting
  def self.user(user_id)
    SomeApi.get('/users/#{user_id}')
  end

  def self.account(account_id)
    SomeApi.get("/accounts/#{account_id}")
  end
end
```

Now, let's say you want to record each invocation of `SomeApi.get` from `Accounting` module's public functions to log their name and arguments (sudo code):

```ruby
def self.user(user_id)
  record do
    SomeApi.get('/users/#{user_id}')
  end
end

def self.account(account_id)
  record do
    SomeApi.get("/accounts/#{account_id}")
  end
end
```

Since Ruby has very powerful meta-programming abilities, we can get access to current method's name and its parameter with `__method__` and `method('method_name').parameters`.

With this knowledge, we can build our helper `record` function:

```ruby
def record(caller_binding, &block)
  method_name = caller_binding.eval('__method__')
  params = method(method_name).parameters.map do |_, name|
    [name, caller_binding.local_variable_get(name)]
  end.to_h

  block.call.tap do |result|
    # record the method who called a block, e.g. in a database
    ApiActivity.create!(method: method_name, params: params)
  end
end
```

We rely on ability of passing [binding](https://ruby-doc.org/core-2.5.1/Binding.html){:target="_blank"} (execution context) to have access to the caller.

```ruby
def self.user(user_id)
  record(binding) do
    SomeApi.get('/users/#{user_id}')
  end
end
```
