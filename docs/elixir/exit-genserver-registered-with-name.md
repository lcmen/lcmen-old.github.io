---
layout: default
title: Exit GenServer registered with name
date: 2022-10-06
parent: Elixir
---

# Exit GenServer registered with name

If a process implementing `GenServer` is registered with a name, like on the example below:

```elixir
defmodule InfoSys.Cache do
  use GenServer

  def start_link(opts) do
    opts = Keyword.put(opts, :name, __MODULE__)
    GenServer.start_link(__MODULE__, opts, name: __MODULE__)
  end

  ...
end
```

To send exist signal to such process, the pid of the currently registered instance needs to be passed to `Process.exist` function.
To find this pid `GenServer.whereis` can be used. The whole snippet will look as follows:

```elixir
InfoSyc.Cache |> GenServer.whereis() |> Process.exit(:kill)
```
