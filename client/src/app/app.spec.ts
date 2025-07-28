// app.component.spec.ts

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterModule }              from '@angular/router';
import { By }                        from '@angular/platform-browser';

import { App }                       from './app';

describe('App', () => {
  let fixture: ComponentFixture<App>;
  let component: App;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        App,                   // standalone component
        RouterModule.forRoot([]) // provides RouterOutlet & Router
      ]
    }).compileComponents();

    fixture   = TestBed.createComponent(App);
    component = fixture.componentInstance;
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should expose a title signal with initial value "client"', () => {
    // title is protected; access via any
    const titleSignal = (component as any).title;
    expect(typeof titleSignal).toBe('function');
    expect(titleSignal()).toBe('client');
  });

  it('should render a <main class="app-main">', () => {
    fixture.detectChanges();
    const mainEl = fixture.debugElement.query(By.css('main.app-main'));
    expect(mainEl).toBeTruthy();
  });

  it('should contain a <router-outlet> directive', () => {
    fixture.detectChanges();
    const outlet = fixture.debugElement.query(By.css('router-outlet'));
    expect(outlet).toBeTruthy();
  });
});
