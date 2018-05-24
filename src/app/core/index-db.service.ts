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
    // if there is currentUser, set currentUser
    if (localStorage.getItem('currentUser')) {
      this.currentUserSubject.next(localStorage.getItem('currentUser'));
    }

    // database version change
    idb.open('app', 1, upgradeDB => {
        upgradeDB.createObjectStore('users', {
            keyPath: 'id',
            autoIncrement: true
        });
        // todolist table
        const todoListTable = upgradeDB.createObjectStore('todoList', { keyPath: 'id', autoIncrement: true });
        todoListTable.createIndex('usernameIndex', 'username', {unique: false});
    })
  }
  getRegisteredUsers() {
    const resultArr = [];
    idb.open('app', 1).then(db => {
      const tx = db.transaction('users', 'readonly');
      const store = tx.objectStore('users');
      store.openCursor(null, 'prev').then(function iterateCursor(cursor) {
        if (!cursor) {
          return;
        }
        resultArr.push(cursor.value);
        return cursor.continue().then(iterateCursor);
      });
      return tx.complete;
    }).then(() => {
      this.registeredUsersSubject.next(resultArr);
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
  addNewUser(name: string, time: Date) {
    let addNewUserDBThread;
    return idb.open('app', 1).then(db => {
      addNewUserDBThread = db;
      const tx = db.transaction('users', 'readwrite');
      const store = tx.objectStore('users');
      return store.add({username: name, registeredTime: time});
    }).then(() => {
      addNewUserDBThread.close();
      // get user list
      this.getRegisteredUsers();
    });
  }

  setCurrentUser(username: string) {
    if (!username) {
      localStorage.removeItem('currentUser');
    } else {
      localStorage.setItem('currentUser', username);
    }
    this.currentUserSubject.next(localStorage.getItem('currentUser'));
  }

  getTodoList(username: string) {
    const resultArr = [];
    idb.open('app', 1).then(db => {
      const tx = db.transaction('todoList', 'readonly');
      const store = tx.objectStore('todoList');
      const usernameIndex = store.index('usernameIndex');
      usernameIndex.openCursor(username, 'prev').then(function iterateCursor(cursor) {
        if (!cursor) {
          return;
        }
        resultArr.push(cursor.value);
        return cursor.continue().then(iterateCursor);
      });
      return tx.complete;
    }).then(() => {
      this.todolistSubject.next(resultArr);
    });
  }
  addTodoItem(todoItem: TodoList.TodoItem) {
    let addItemDBThread;
    idb.open('app', 1).then(db => {
      addItemDBThread = db;
      const tx = db.transaction('todoList', 'readwrite');
      const store = tx.objectStore('todoList');
      return store.add(todoItem);
    }).then(item => {
      addItemDBThread.close();
      // get todolist
      this.getTodoList(todoItem.username);
    });
  }

  deleteTodoItem(todoItem: TodoList.TodoItem) {
    let deleteItemDBThread;
    idb.open('app', 1).then(db => {
      deleteItemDBThread = db;
      const tx = db.transaction('todoList', 'readwrite');
      const store = tx.objectStore('todoList');
      return store.delete(todoItem.id);
    }).then(item => {
      deleteItemDBThread.close();
      // get todolist
      this.getTodoList(todoItem.username);
    });
  }
}
