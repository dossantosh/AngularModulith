import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ThemeToggleComponent } from './theme-toggle.component';
import { ThemeService } from './theme.service';

describe('ThemeToggleComponent', () => {
  let fixture: ComponentFixture<ThemeToggleComponent>;
  let themeService: ThemeService;

  beforeEach(async () => {
    localStorage.clear();
    document.documentElement.classList.remove('light', 'dark');

    await TestBed.configureTestingModule({
      imports: [ThemeToggleComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ThemeToggleComponent);
    themeService = TestBed.inject(ThemeService);
  });

  afterEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove('light', 'dark');
    TestBed.resetTestingModule();
  });

  it('renders the opposite theme icon', () => {
    themeService.setTheme('dark');
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('light_mode');
  });

  it('toggles theme when clicked', () => {
    themeService.setTheme('light');
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    button.click();
    fixture.detectChanges();

    expect(themeService.theme()).toBe('dark');
  });
});
