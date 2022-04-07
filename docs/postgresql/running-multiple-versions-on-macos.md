---
layout: default
title: Running multiple PostgreSQL versions on MacOS
date: 2018-12-04
parent: PostgreSQL
---

# Running multiple PostgreSQL versions on MacOS

It's possible to run multiple versions of PostgreSQL using excellent [Postgres.app](https://postgresapp.com). It's very good solution as long as you don't need older Postgres versions (`Postgres.app` allows to run up to 4 last major versions).

This is an alternative solution which allows to run older versions and easily switch between them.

Start with tapping `petere`'s `Homebrew` repo:

```
brew tap petere/postgresql
```

Then install `postgresql-common` package which provides special wrapper scripts for running managing the clusters.

Now you can install multiple PostgreSQL versions:

```
brew install postgresql@11
brew install postgresql@12
```

## Usage

Before starting the database server, you need to create a cluster. You can do it with: `pg_createcluster {version} {name}` command, for example:

```
pg_createcluster 11 main
```

You can also specify port to associate with cluster using `-p` option (I use this simple rule to easily remember port for each version: **11** - *5431*, **12** - *5432*, **13** - *5433*, and so on):

```
pg_createcluster 11 main -p 5431
```

To connect to newly created cluster with `psql` provide cluster-version pair with `--cluster` option:

```
psql --cluster 11/main -d postgres
```

If you prefer to use user with password authentication instead of `peer`, specify `-h localhost`:

```
psql --cluster 11/main -d postgres -h localhost
```

## Cheatsheet

- `pg_lsclusters` list all clusters
- `pg_dropcluster` remove a cluster
- `pg_ctlcluster {version} {name} start` start a cluster
- `pg_ctlcluster {version} {name} stop` stop a cluster
- `pg_ctlcluster {version} {name} status` check claster's status
