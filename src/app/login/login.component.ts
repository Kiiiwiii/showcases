import { Component, OnInit } from '@angular/core';
import { IndexDbService } from '../core/index-db.service';
import { Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  usernameWaitForRegistration: string;
  registeredUsers: TodoList.User[];
  currentUser: Observable<string | null>;
  constructor(private indexedDBService: IndexDbService,
    private router: Router) { }

  ngOnInit() {
    // get registered users list
    this.indexedDBService.registeredUsers.subscribe(users => {
      this.registeredUsers = users;
    });
    this.indexedDBService.getRegisteredUsers();
    // get current user
    this.currentUser = this.indexedDBService.currentUser;
  }
  signIn() {
    this.indexedDBService.isUserAlreadyExist(this.usernameWaitForRegistration).then(isExist => {
      if (!isExist) {
        this.indexedDBService.addNewUser(this.usernameWaitForRegistration, new Date());
      }
      // direct to real todo list page
      this.indexedDBService.setCurrentUser(this.usernameWaitForRegistration);
      this.router.navigate(['home']);
    });
  }
  directToList() {
    this.router.navigate(['home']);
  }
  logout() {
    this.indexedDBService.setCurrentUser('');
  }
}
