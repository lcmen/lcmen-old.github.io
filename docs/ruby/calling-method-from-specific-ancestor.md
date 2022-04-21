---
layout: default
title: Calling Ruby method from specific ancestors
date: 2021-11-07
parent: Ruby
---

# Calling Ruby method from specific ancestors

Recently, I wanted to use `attr_encrypted` method from [symmetric-encryption](https://github.com/reidmorrison/symmetric-encryption){:target="_blank"} gem in one of the models in my Rails application.

Because of [devise](https://github.com/heartcombo/devise){:target="_blank"} (which relies on [attr_encrypted](https://github.com/attr-encrypted/attr_encrypted){:target="_blank"} gem) being used in the codebase, whenever I used `attr_encrypted` in the model, I called method from `attr_encrypted` gem instead of `symmetric-encryption`. It was caused by higher position of `AttrEncrypted` module in the eigenclass's `included_modules`.

```ruby
> MyModel.superclass.included_modules
=> [AttrEncrypted::Adapters::ActiveRecord, AttrEncrypted, ..., SymmetricEncryption::ActiveRecord::AttrEncrypted::ClassMethods, ...]
```

**EDIT: This applies to Rails version 6 and below which doesn't include ActiveRecord Encryption.**

Since `SymmetricEncryption::ActiveRecord::AttrEncrypted` is already injected, extending it in the model (or including it on `MyModel.supperclass`) again wouldn't move it to the top of the list. To work around it, I decided to use an alternative solution based on an unbound method to execute a method from a given object in the context of that class:

```ruby
SymmetricEncryption::ActiveRecord::AttrEncrypted.instance_method(:attr_encrypted).bind(self).call
```

To make it easier to use from the models, helper class method can be added to `ApplicationRecord`:

```ruby
class ApplicationRecord
  def self.attr_encrypted_symmetrically(*args, **kwargs)
    SymmetricEncryption::ActiveRecord::AttrEncrypted::ClassMethods.instance_method(:attr_encrypted).bind(self).call(*args, **kwargs)
  end
end
```

EDIT: Unbound method can be passed directly to `define_method` / `define_singleton_method` which makes it even more compact:

```ruby
class ApplicationRecord
  define_singleton_method :attr_encrypted_symmetrically, SymmetricEncryption::ActiveRecord::AttrEncrypted::ClassMethods.instance_method(:attr_encrypted)
end
```

Then:

```ruby
class MyModel
  attr_encrypted_symmetrically :password
end
```
