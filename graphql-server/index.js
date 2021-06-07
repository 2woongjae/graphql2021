const { ApolloServer, gql } = require("apollo-server");
const { readFileSync, writeFileSync } = require("fs");
const { join } = require("path");

// The GraphQL schema
const typeDefs = gql`
  type Query {
    "A simple type for getting started!"
    hello: String
    books: [Book]
    book(bookId: Int): Book
  }
  type Mutation {
    addBook(title: String, message: String, author: String, url: String): Book
    editBook(
      bookId: Int
      title: String
      message: String
      author: String
      url: String
    ): Book
    deleteBook(bookId: Int): Book
  }
  type Book {
    bookId: Int
    title: String
    message: String
    author: String
    url: String
  }
`;

// A map of functions which return data for the schema.
const resolvers = {
  Query: {
    hello: () => "world",
    books: () => {
      return JSON.parse(readFileSync(join(__dirname, "books.json")).toString());
    },
    book: (parent, args, context, info) => {
      const books = JSON.parse(
        readFileSync(join(__dirname, "books.json")).toString()
      );
      return books.find((book) => book.bookId === args.bookId);
    },
  },
  Mutation: {
    addBook: (parent, args, context, info) => {
      const books = JSON.parse(
        readFileSync(join(__dirname, "books.json")).toString()
      );
      const maxId = Math.max(...books.map((book) => book.bookId));
      const newBook = { ...args, bookId: maxId + 1 };
      writeFileSync(
        join(__dirname, "books.json"),
        JSON.stringify([...books, newBook])
      );
      return newBook;
    },
    editBook: (parent, args, context, info) => {
      const books = JSON.parse(
        readFileSync(join(__dirname, "books.json")).toString()
      );

      const newBooks = books.map((book) => {
        if (book.bookId === args.bookId) {
          return args;
        } else {
          return book;
        }
      });

      writeFileSync(join(__dirname, "books.json"), JSON.stringify(newBooks));

      return args;
    },
    deleteBook: (parent, args, context, info) => {
      const books = JSON.parse(
        readFileSync(join(__dirname, "books.json")).toString()
      );

      const deleted = books.find((book) => book.bookId === args.bookId);

      const newBooks = books.filter((book) => book.bookId !== args.bookId);

      writeFileSync(join(__dirname, "books.json"), JSON.stringify(newBooks));

      return deleted;
    },
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
  playground: true,
});

server.listen().then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);
});
