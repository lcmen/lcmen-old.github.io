---
layout: default
title: Prepared statements in PostgreSQL
date: 2023-02-02
parent: PostgreSQL
---

# Prepared statements in PostgreSQL

Prepared statements are one of the mechanisms that PostgreSQL provides to improve performance. The query is pre-compiled and cached, so subsequent queries relying on a similar structure can reuse it (at least until the table schema changes). Instead of parsing the query every time it's executed, the database can reuse the prepared plan, reducing the overhead. Prepared statements also protect against SQL injection by separating the query from its parameters.

To create a prepared statement, the `PREPARE` function is used:

```sql
PREPARE users_plan (text) AS SELECT id, email FROM users WHERE name = $1;
EXECUTE users_plan('lucas');
```

Some frameworks, such as Rails and its ActiveRecord, automatically convert queries into prepared statements. To view the currently cached statements, you can run:

```sql
SELECT * FROM pg_prepared_statements;
```

| name       | statement                                                                 | prepare_time        | parameter_types | from_sql |
|------------|---------------------------------------------------------------------------|---------------------|-----------------|----------|
| users_plan | PREPARE users_plan (text) AS SELECT id, email FROM users WHERE name = $1; | 2023-02-02 20:13:30 | {text}          | t        |

## Named vs unnamed

There are 2 types of prepared statements in PostgreSQL to choose from:

1. `Named` - These statements are cached within a single session and given a unique name for easy recall.
2. `Unnamed` - These are parametrized statements that are automatically deallocated when the next unnamed statement is generated within the same session.

When using [PgBouncer](https://www.pgbouncer.org/){:target="_blank"} (especially in `transaction` or `statement` pooling modes), it's important to either disable named statements or replace them with unnamed ones. This is because database interactions (such as web requests with multiple queries and transactions) can occur across different connections.

## Prepared statement planning

During the first five executions, PostgreSQL creates plans which takes parameter values into account. After that, generic plan (independent of parameter values) is created, and if it's estimated to be no more expensive, it will be used from that point on.

When executing a query in PostgreSQL, the first five times the query is run, the database creates plans that take into account the specific parameter values and calculates average cost. After that, the generic plan that is independent of the parameter values is generated and its cost is compared with previous custom plans. If it's not much more expensive, it will be used for all subsequent executions.
