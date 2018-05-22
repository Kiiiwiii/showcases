import { Component, OnInit } from '@angular/core';
import { IndexDbService } from '../core/index-db.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  username: string;
  registeredUsers: TodoList.User[];
  currentUser: string;
  constructor(private indexedDBService: IndexDbService,
    private router: Router) { }

  ngOnInit() {
    this.indexedDBService.registeredUsers.subscribe(users => {
      this.registeredUsers = users;
    });
    this.indexedDBService.getRegisteredUsers();
  }
  signIn() {
    this.indexedDBService.isUserAlreadyExist(this.username).then(isExist => {
      if (!isExist) {
        this.indexedDBService.addNewUser(this.username);
      }
      // direct to real todo list page
      this.indexedDBService.setCurrentUser(this.username);
      setTimeout(() => {
        this.router.navigate(['home']);
      }, 300);
    });
  }
}
