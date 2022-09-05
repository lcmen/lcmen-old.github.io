---
layout: default
title: Customize params in Phoenix links
date: 2022-09-05
parent: Elixir
---

# Customize params in Phoenix links

Whenever we pass a struct to a route helper, `Phoenix.Param` (by default) calls `id` on a given struct to convert it to URL parameter.

```elixir
# Custom links can be tested in the mix console by replacing @conn with %URI{} or
# MyAppWeb.Endpoint.struct_url().
Routes.profile_path(@conn, :show, user.profile) # /profile/:id
```

This behaviour can be customized by implementing `Phoenix.Param` protocol for a specific struct, e.g.

```elixir
defimpl Phoenix.Param, for: Accounts.Profile do
  def to_param(profile) do
    "#{profile.id}-#{profile.username}"
  end
end
```

We can add these implementations to any file in the codebase but the common convention is to place them either in the same file as related struct or group all of them in a single place (e.g. `lib/yourappweb/param.ex`).

Now, whenever we pass `%Profile{}` to the helper, Phoenix will take username out of `Profile` for its parameter.

```elixir
Routes.profile_path(@conn, :show, user.profile) # /profile/bob-smith
```

Unfortunately, if we try to use this parameter in the controller and pass it directly to a repo (e.g. with `Repo.find(Profile, id)`), Ecto will throw error as it won't know how to cast string into an id. To fix this, we need to create a custom type that extends the built-in id type to understand such format.

```elixir
defmodule MyApp.Permalink do
  use Ecto.Type

  def type, do: :id

  def cast(binary) when is_binary(binary) do
    case Integer.parse(binary) do
      {int, _} when int > 0 -> {:ok, int}
      _ -> :error
    end
  end

  def cast(integer) when is_integer(integer) do
    {:ok, integer}
  end

  def cast(_) do
    :error
  end

  def dump(integer) when is_integer(integer) do
    {:ok, integer}
  end

  def load(integer) when is_integer(integer) do
    {:ok, integer}
  end
end
```

Then, we use this type as a primary key on Accounts.Profile schema.

```elixir
@primary_key {:id, MyApp.Permalink, autogenerate: true}
schema "profiles" do
  ...
end
```

Now, we can create links and implement controllers as usual, and enjoy user-friendly URLs.
