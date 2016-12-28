/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { MnMapComponent } from './mn-map.component';

describe('MnMapComponent', () => {
  let component: MnMapComponent;
  let fixture: ComponentFixture<MnMapComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MnMapComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MnMapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
