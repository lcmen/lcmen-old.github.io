---
layout: default
title: Lesser known Rails 7 features
date: 2022-07-19
parent: Ruby
---

# Lesser known Rails 7 features

Rails 7 is major release of the Ruby on Rails framework packed with improvements, fixes and new features (`async_load`, new css/js bundling mechanism, Turbo and more!).

However it also includes helpful classes and methods that can make your day to day coding easier. Here are the ones that I found the most useful (in no particular order).

## Enumerable#flat_map

It can replace `map(...).compact` so you can write:

```ruby
collection.flat_map(&:token)
```

## Enumerable#sole

Returns the first element or raise an exception if there are more elements in the collection:

```ruby
["foo"].sole # => "foo"
["foo", "bar"].sole # => Enumerable::SoleItemExpectedError
{ foo: "bar" }.sole # => [:foo, "bar"]
{ foo: "bar", biz: "baz" }.sole # => Enumerable::SoleItemExpectedError
```

It also works on `ActiveRecord` relations:

```ruby
User.where(admin: true).sole
```

## Comparison validator

Built in validator for comparing various types:

```ruby
validates :birth_date, comparison: { less_than_or_equal_to: -> { Date.today }}
validates :username, comparison: { other_than: :first_name }
```

## Helpers for phone / sms links

```
<%= phone_to "55512345678", "Call me" %>
```

gives `<a href="tel:+0155512345678">Call me</a>`, while:

<%= sms_to "55512345678", body: "Help me with" do %>
  Ask for help
<% end %>

outputs `<a href="sms:55512345678;?body=Help%20me%20with">Ask for help</a>`.

## ActiveRecord::Relation#excluding

Allows to exclude some records from the query

```ruby
admins = User.where(admin: true)
users = User.excluding(admins)
```

## ActiveRecord::Relation#invert_where

Inverts currently applied conditions:

```ruby
class User < ApplicationRecord
  scope :admins, -> { where(admin: true) }
end
User.admins.invert_where => ... WHERE NOT admin = true
```
