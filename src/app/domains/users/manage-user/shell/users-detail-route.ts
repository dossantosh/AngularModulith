import { ActivatedRoute } from '@angular/router';

export function userIdFromRoute(route: ActivatedRoute): number | null {
  const id = route.parent?.snapshot.paramMap.get('id') ?? route.snapshot.paramMap.get('id');
  const userId = Number(id);

  return Number.isInteger(userId) && userId > 0 ? userId : null;
}
