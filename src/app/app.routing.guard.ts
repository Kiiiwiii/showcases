import { CanActivate, Router } from "@angular/router";
import { IndexDbService } from "./core/index-db.service";
import { Injectable } from "@angular/core";
@Injectable()
export class AppRoutingGuard implements CanActivate {
    currentUser: string | null;
    constructor(
        private router: Router,
        private indexDBService: IndexDbService
    ) {
        this.indexDBService.currentUser.subscribe(currentUser => {
            this.currentUser = currentUser;
        });
    }

    canActivate() {
        if (this.currentUser) {
            return true;
        }
        this.router.navigate(['/login']);
        return false;
    }
}
