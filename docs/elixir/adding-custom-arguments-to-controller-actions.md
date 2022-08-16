---
layout: default
title: Adding custom arguments to Phoenix controller's actions
date: 2022-08-16
parent: Elixir
---

# Adding custom arguments to Phoenix controller's actions

Sometimes we would like to add additional arguments (e.g. current user) to all actions in a given controller.

*Just to remind: controller actions by default accepts 2 arguments: plug connection, and request params (payload) like this: `def index(conn, params), do: ...`*

Phoenix routing architecture is built around [Plug](https://hexdocs.pm/plug/readme.html){:target="_blank"}-based architecture and Phoenix controllers are also plugs. To call them, Phoenix invokes the default `action` function at the end of the controller pipeline.

With this knowledge in mind, we can override the default method, and use `apply` with our extra arguments:

```elixir
def action(conn, _) do
  args = [conn, conn.params, conn.assigns[:current_user]]
  apply(__MODULE__, action_name(conn), args)
end
```

*`action_name` will return current controller's method that should handle the requests in conn*
