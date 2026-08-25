import { TestBed } from '@angular/core/testing';
import { provideRouter, Router, UrlTree, convertToParamMap } from '@angular/router';
import { firstValueFrom, isObservable, of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { groupOwnerGuard } from './group-owner.guard';
import { GroupService } from '../services/group.service';
import { GroupDetail } from '../models/group.model';

function makeGroup(overrides: Partial<GroupDetail> = {}): GroupDetail {
  return {
    id: 'group-1',
    name: 'Python Beginners',
    description: '',
    owner_username: 'meir',
    is_owner: true,
    videos_count: 0,
    members_count: 0,
    created_at: '2026-01-01T00:00:00Z',
    ...overrides,
  };
}

describe('groupOwnerGuard', () => {
  let groupServiceMock: { getGroupDetail: ReturnType<typeof vi.fn> };
  let router: Router;

  async function runGuard(groupId: string | null) {
    const route = { paramMap: convertToParamMap(groupId ? { id: groupId } : {}) };
    const result = TestBed.runInInjectionContext(() => groupOwnerGuard(route as never, {} as never));
    return isObservable(result) ? firstValueFrom(result) : result;
  }

  beforeEach(() => {
    groupServiceMock = { getGroupDetail: vi.fn() };
    TestBed.configureTestingModule({
      providers: [provideRouter([]), { provide: GroupService, useValue: groupServiceMock }],
    });
    router = TestBed.inject(Router);
  });

  it('allows navigation when the current user is the group owner', async () => {
    groupServiceMock.getGroupDetail.mockReturnValue(of(makeGroup({ is_owner: true })));
    const result = await runGuard('group-1');
    expect(result).toBe(true);
  });

  it('redirects to the read-only view when the user is a member but not the owner', async () => {
    groupServiceMock.getGroupDetail.mockReturnValue(of(makeGroup({ is_owner: false })));
    const result = (await runGuard('group-1')) as UrlTree;
    expect(router.serializeUrl(result)).toBe('/groups/group-1/view');
  });

  it('redirects to the dashboard when the group cannot be loaded (403/404)', async () => {
    groupServiceMock.getGroupDetail.mockReturnValue(throwError(() => new Error('forbidden')));
    const result = (await runGuard('group-1')) as UrlTree;
    expect(router.serializeUrl(result)).toBe('/dashboard');
  });

  it('redirects to the dashboard when there is no group id in the route', async () => {
    const result = (await runGuard(null)) as UrlTree;
    expect(router.serializeUrl(result)).toBe('/dashboard');
    expect(groupServiceMock.getGroupDetail).not.toHaveBeenCalled();
  });
});
