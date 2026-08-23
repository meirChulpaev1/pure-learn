import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { GroupService } from '../core/services/group.service';

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent {
  protected groupService = inject(GroupService);
}
