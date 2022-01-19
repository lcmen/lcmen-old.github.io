---
layout: default
title: Destructuring lists with various number of elements in Elixir
date: 2022-01-19
parent: Elixir
---

# Destructuring lists with various number of elements in Elixir

The most common way to destructure structs, maps or lists in Elixir is through pattern matching.

Example for maps:

```elixir
%{foo: foo, bar: bar} = %{foo: 1, bar: 2}
foo # 1
bar # 2
```

And for lists:

```elixir
[foo, bar, baz] = [1, 2, 3]
foo # 1
bar # 2
baz # 3
```

If the list on the right side has more elements, we can always use `|` operator to ignore more elements (if exist):

```elixir
[foo, bar, baz | _] = [1, 2, 3, 4]
foo # 1
bar # 2
baz # 3
```

Unfortunately, destructuring through pattern matching has one drawback, if the list on the right side has less elements than the one on the left, Elixir will raise error:

```elixir
[foo, bar, baz] = [1, 2]
# ** (MatchError) no match of right hand side value: [1, 2]
```

To overcome this, `Kernel` module provides [destructure](https://hexdocs.pm/elixir/Kernel.html#destructure/2){:target="_blank"} method which takes 2 arguments and assign right to the left:

```elixir
destructure([foo, bar, baz], [1, 2])
foo # 1 
bar # 2
baz # nil
```
