import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { AppPaginationBarComponent } from './app-pagination-bar.component';

@Component({
  standalone: true,
  imports: [AppPaginationBarComponent],
  template: `
    <app-pagination-bar
      [previousDisabled]="previousDisabled"
      [nextDisabled]="nextDisabled"
      (previous)="previousCount = previousCount + 1"
      (next)="nextCount = nextCount + 1"
    />
  `,
})
class HostComponent {
  previousDisabled = false;
  nextDisabled = false;
  previousCount = 0;
  nextCount = 0;
}

describe('AppPaginationBarComponent', () => {
  let fixture: ComponentFixture<HostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(HostComponent);
  });

  it('emits previous and next events', () => {
    fixture.detectChanges();
    const buttons = fixture.debugElement.queryAll(By.css('button'));

    buttons[0].nativeElement.click();
    buttons[1].nativeElement.click();

    expect(fixture.componentInstance.previousCount).toBe(1);
    expect(fixture.componentInstance.nextCount).toBe(1);
  });

  it('disables each action independently', () => {
    fixture.componentInstance.previousDisabled = true;
    fixture.componentInstance.nextDisabled = false;
    fixture.detectChanges();

    const buttons = fixture.debugElement.queryAll(By.css('button'));

    expect(buttons[0].nativeElement.disabled).toBe(true);
    expect(buttons[1].nativeElement.disabled).toBe(false);
  });
});
