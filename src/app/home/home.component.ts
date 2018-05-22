/*
 * Copyright (c) 2016 VMware, Inc. All Rights Reserved.
 * This software is released under MIT license.
 * The full license information can be found in LICENSE in the root directory of this project.
 */
import { Component, OnInit } from "@angular/core";
import { IndexDbService } from "../core/index-db.service";

@Component({
    selector: 'app-home',
    styleUrls: ['./home.component.scss'],
    templateUrl: './home.component.html',
})
export class HomeComponent implements OnInit {
    todos: TodoList.TodoItem[] = [];

    todoTitle: string;
    todoText: string;

    currentUser: string;
    constructor(private indexedDBService: IndexDbService) {}
    ngOnInit(): void {
      this.currentUser = this.indexedDBService.currentUser;
      this.indexedDBService.todolist.subscribe(todolist => {
        this.todos = todolist;
      })
      this.indexedDBService.getTodoList(this.currentUser);
    }

    addTodoItem() {
      const date = new Date();
      const todoItem: TodoList.TodoItem = {
        username: this.currentUser,
        title: this.todoTitle,
        text: this.todoText,
        date: date
      }
      this.indexedDBService.addTodoItem(todoItem);
      // refresh the input field;
      this.todoTitle = this.todoText = '';
    }

    deleteItem(todo: TodoList.TodoItem) {
      this.indexedDBService.deleteTodoItem(todo);
    }
}
