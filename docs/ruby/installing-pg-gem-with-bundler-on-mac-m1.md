---
layout: default
title: Installing pg_gem with Bundler on Mac M1
date: 2022-06-05
parent: Ruby
---

# Installing pg gem with bundler on Mac M1	

If you're lucky / unlucky (whichever applies to you) to own M1 powered Macbook, you may encounter errors when installing `pg` gem using `bundle install` command for your Ruby application.

The fix them, you need to obtain `libpq` from Homebrew and configure `bundler` to use `pg_config` from there.

*If you followed [setup for running multiple Postgres versions on Mac OS]({% link docs/postgresql/running-multiple-versions-on-macos.md %}), you might already have `pg_config` in your `$PATH`. Unfortunately, it's not compatible with `pg` gem and `libpq` from Homebrew must be used.*

The full solution strips down into 2 commands:

1. `brew install libpq`
2. `bundle config set --global build.pg --with-pg-config=/opt/homebrew/opt/libpq/bin/pg_config`

Now you can run `bundle install` and keep developing as usual.
