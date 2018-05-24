// Typings reference file, you can add your own global typings here
// https://www.typescriptlang.org/docs/handbook/writing-declaration-files.html
declare namespace TodoList{
  interface User {
    username: string,
    registeredTime: Date,
    id: number
  }
  interface TodoItem {
    username: string,
    title: string,
    text: string,
    date: Date,
    id?: number,
  }
}