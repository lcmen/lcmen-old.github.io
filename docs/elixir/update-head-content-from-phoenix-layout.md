---
layout: default
title: Update head content from Phoenix layout
date: 2023-03-07
parent: Elixir
---

# Update head content from Phoenix layout

Phoenix supports multiple nested layouts. By default, it comes with two levels of layouts:

- `root` with a basic HTML scaffold that includes elements such as head, body, etc.
- `app` with app-specific components, such as nav, footer, etc.

As a Rails developer, I was looking for a similar functionality to Rails' [content_for](https://guides.rubyonrails.org/layouts_and_rendering.html#using-the-content-for-method){:target="_blank"} function, which allows developers to inject content into a parent's <head> tag from a lower-level layout.

To provide an example, here is how you would achieve this functionality in Rails:

`root` layout with 2 content sections:

```html
<!-- app/views/layouts/root.html.erb --->
<html>
  <head>
  <%= yield :head %>
  </head>
  <body>
  <%= yield %>
  </body>
</html>
```

and `app` layout:

```html
<% content_for :head do %>
  <script defer src="..."></script>
<% end %>

<nav>...</nav>
<section>
  <%= yield %>
</section>
<footer>...</footer>
```

Despite my best efforts, I couldn't find a feature similar to Rails' `content_for` in Phoenix. As far as I understand, Phoenix renders templates in a single, hierarchical manner - with `plug.conn` being passed down the template chain. This is demonstrated in the following chart:

```
root(conn)
    |
@inner_content -> app(conn)
                       |
                 @inner_content -> template(conn)
```

To work around this limitation, I created a simple functional component that is inserted into the root template. This component is responsible for rendering content based on the current layout, which is stored in the `conn.private.phoenix_layout` variable."

```html
<!--- root.html.heex --->
<head>
  ...
  <%= head_content @conn.private %>
</head>
<body>
  <%= @inner_content %>
</body>
```

Where `head_content` method is defined as follows:

```elixir
defmodule YourAppWeb.Layouts do
  use YourAppWeb, :html

  embed_templates "layouts/*"

  def head_content(%{phoenix_layout: %{"html" => {__MODULE__, layout}}}) do
    scripts_for(layout)
  end

  defp head_content_for(:app) do
    assigns = %{}
    ~H"""
    <script defer phx-track-static type="text/javascript" src={~p"/assets/app.js"}></script>
    """
  end

  defp head_content_for(_), do: ""
end
```

With this solution, `/assets/app.js` file will only be included in the app layout.

PS: If you have a better solution or if you notice an error in my understanding, please don't hesitate to let me know on Twitter.
