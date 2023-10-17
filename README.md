# postgrest-dist

> PostgREST serves a fully RESTful API from any existing PostgreSQL database. It
> provides a cleaner, more standards-compliant, faster API than you are likely
> to write from scratch. -
> [postgrest github](https://github.com/PostgREST/postgrest)

Use [postgrest](http://postgrest.org)
([github](https://github.com/PostgREST/postgrest)) as an npm module for tighter
integration with node apps (e.g. test fixtures). Also enables postgrest usage in
serverless environments.

## Usage

`npm install postgrest-dist`

```javascript
import postgrest from "postgrest-dist";
// Use environment variables to configure postgrest, see https://postgrest.org/en/stable/references/configuration.html
const server = await postgrest();
// Or pass in a custom environment in js, which will be combined with the env of the current process.
const server = await postgrest({
  PGRST_DB_URI: "postgres://postgres@127.0.0.1:5432/postgres",
});

// And shut down when you are done
server.stop();
```

## TODO

- [ ] Add example with `PGRST_SERVER_UNIX_SOCKET` to make it easier to run mulitple instances
