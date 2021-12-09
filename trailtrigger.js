const mysql = require("mysql");
const MySQLEvents = require("@rodrigogs/mysql-events");

process.on("message", (message) => {
  const program = async () => {
    const connection = mysql.createConnection({
      host: "localhost",
      user: "root",
      password: "1234",
    });

    const instance = new MySQLEvents(connection, {
      startAtEnd: true,
      excludedSchemas: {
        mysql: true,
      },
    });

    await instance.start();

    instance.addTrigger({
      name: "TEST",
      expression: "*",
      statement: MySQLEvents.STATEMENTS.ALL,
      onEvent: (event) => {
        process.send({
          event: "database-event",
          database: event.schema,
          table: event.table,
        });
      },
    });

    instance.on(MySQLEvents.EVENTS.CONNECTION_ERROR, console.error);
    instance.on(MySQLEvents.EVENTS.ZONGJI_ERROR, console.error);
  };

  program()
    .then(() => console.log("Waiting for database events..."))
    .catch(console.error);
});

