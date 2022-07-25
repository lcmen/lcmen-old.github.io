---
layout: default
title: Ecto cheatsheet 101
date: 2022-07-25
parent: Elixir
---

# Ecto - cheatsheet 101

To simplify things and focus specifically on `Ecto` queries, this cheatsheet deliberately skips `Ecto.Schema`, and use database tables directly.

## Querying data

Ecto provides 2 ways for writing queries:

1. Expression based:

    ```elixir
    query = select("users", [:id, :name]) |> order(:age)
    Repo.all(query)
    ```

2. Keyword based:

    ```elixir
    query = from(u in "users", select: [:id, :name], order_by: [desc: :age])
    Repo.all(query)
    ```

## Running arbitrary SQL queries

```elixir
{:ok, res} = Ecto.Adapters.SQL.query(Repo, "SELECT * FROM ...")
{:ok, res} = Repo.query("SELECT * FROM ...)
```

## Getting SQL out of Ecto.Query

```elixir
query = from "users, select: [:id, name]
Ecto.Adapters.SQL.to_sql(:all, Repo, query)
Repo.to_sql(:all, query)
```

## Calling Postgres functions in `where` clause

```elixir
query = from u in "users", where: fragment("lower(?)", u.email) == "user@example.com", select: [:id, :name]
Repo.all(query)
```

This can be extracted to custom macro:

```elixir
defmodule MyMacros do
  defmacro lower(arg) do
    quote do
      fragment("lower(?)", unquote(arg))
    end
  end
end

import MyMacros

query = from u in "users", where: lower(u.email) == "user@example.com", select: [:id, :name]
Repo.all(query)
```

## Using Subqueries

```elixir
query = from u in "users", where: u.age > 18, select: [:id]
Repo.all(from q in subquery(query), select: count(q.id))
```

## Using join with named bindings

```elixir
q1 = from u in "users", as: :user, join: p in "profiles", as: :profile
q2 = from [profile: p] in q1, where: p.country == "pl"
q3 = from [user: u] in q2, select: u.email
Repo.all(q3)
```

## Ensuring join is included only once

```elixir
def with_profiles(query) do
  if has_named_binding?(query, :profiles)
    query
  else
    from u in query, join: p in "profiles", as: :profiles, on: p.user_id == u.id
  end
end

q = from u in with_profiles("users"), where: p.country == "pl", select: u.email
Repo.all(q)
```
