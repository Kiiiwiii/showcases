import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import idb from 'idb';
@Injectable()
export class IndexDbService {
  private registeredUsersSubject: BehaviorSubject<TodoList.User[]>;
  registeredUsers: Observable<TodoList.User[]>;

  private todolistSubject: BehaviorSubject<TodoList.TodoItem[]>;
  todolist: Observable<TodoList.TodoItem[]>;

  private currentUserSubject: BehaviorSubject<string>;
  currentUser: Observable<string>;

  constructor() {
    // initial observables
    this.registeredUsersSubject = new BehaviorSubject([]);
    this.registeredUsers = this.registeredUsersSubject.asObservable();

    this.todolistSubject = new BehaviorSubject([]);
    this.todolist = this.todolistSubject.asObservable();

    // TODO: + localStorage 实现
    this.currentUserSubject = new BehaviorSubject('');
    this.currentUser = this.currentUserSubject.asObservable();
    // database version change
    idb.open('app', 1, upgradeDB => {
        upgradeDB.createObjectStore('users', {
            keyPath: 'username'
        });
        // todolist table
        const todoListTable = upgradeDB.createObjectStore('todoList', { keyPath: 'id', autoIncrement: true });
        todoListTable.createIndex('usernameIndex', 'username', {unique: false});
    })
  }
  getRegisteredUsers() {
    idb.open('app', 1).then(db => {
      const tx = db.transaction('users', 'readonly');
      const store = tx.objectStore('users');
      return store.getAll();
    }).then(users => {
      this.registeredUsersSubject.next(users);
    });
  }
  isUserAlreadyExist(username: string): Promise<boolean> {
    return idb.open('app', 1).then(db => {
      const tx = db.transaction('users', 'readonly');
      const store = tx.objectStore('users');
      return store.getAll();
    }).then(users => {
      return users.filter(user => {
        return user.username === username;
      });
    }).then(users => {
      return users.length === 0 ? false : true;
    });
  }
  addNewUser(name: string) {
    let tx, store;
    return idb.open('app', 1).then(db => {
      tx = db.transaction('users', 'readwrite');
      store = tx.objectStore('users');
      return store.add({username: name});
    }).then(user => {
      return store.getAll();
    }).then(users => {
      this.registeredUsersSubject.next(users);
    });
  }

  setCurrentUser(username: string) {
    this._currentUser = username;
  }

  getTodoList(username: string) {
    idb.open('app', 1).then(db => {
      const tx = db.transaction('todoList', 'readonly');
      const store = tx.objectStore('todoList');
      const usernameIndex = store.index('usernameIndex');
      return usernameIndex.getAll(username);
    }).then(todolist => {
      this.todolistSubject.next(todolist);
    });
  }
  addTodoItem(todoItem: TodoList.TodoItem) {
    let store, tx;
    idb.open('app', 1).then(db => {
      tx = db.transaction('todoList', 'readwrite');
      store = tx.objectStore('todoList');
      return store.add(todoItem);
    }).then(item => {
      const usernameIndex = store.index('usernameIndex');
      return usernameIndex.getAll(todoItem.username);
    }).then(todolist => {
      this.todolistSubject.next(todolist);
    });
  }

  deleteTodoItem(todoItem: TodoList.TodoItem) {
    let store, tx;
    idb.open('app', 1).then(db => {
      tx = db.transaction('todoList', 'readwrite');
      store = tx.objectStore('todoList');
      return store.delete(todoItem.id);
    }).then(item => {
      const usernameIndex = store.index('usernameIndex');
      return usernameIndex.getAll(todoItem.username);
    }).then(todolist => {
      this.todolistSubject.next(todolist);
    });
  }
}
