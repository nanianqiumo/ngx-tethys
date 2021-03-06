import {
    ViewContainerRef,
    Component,
    ViewChild,
    Directive,
    NgModule,
    TemplateRef
} from '@angular/core';
import {
    TestBed,
    ComponentFixture,
    fakeAsync,
    flushMicrotasks,
    inject,
    flush,
    tick
} from '@angular/core/testing';
import { Location } from '@angular/common';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { SpyLocation } from '@angular/common/testing';
import { ThyDialog, ThyDialogModule } from '../index';
import { OverlayContainer } from '@angular/cdk/overlay';
import { Subject } from 'rxjs';
import { ThyDialogRef } from '../dialog-ref';
import {
    WithChildViewContainerComponent,
    DialogTestModule,
    DialogContentComponent,
    WithTemplateRefComponent,
    WithViewContainerDirective,
    WithInjectedDataDialogComponent,
    WithOnPushViewContainerComponent
} from './module';
import { ESCAPE, A } from '../../util/keycodes';
import { dispatchKeyboardEvent } from '../../core/testing';

describe('ThyDialog', () => {
    let dialog: ThyDialog;
    let overlayContainer: OverlayContainer;
    let overlayContainerElement: HTMLElement;
    // let scrolledSubject = new Subject();

    let testViewContainerRef: ViewContainerRef;
    let viewContainerFixture: ComponentFixture<WithChildViewContainerComponent>;
    let mockLocation: SpyLocation;

    beforeEach(fakeAsync(() => {
        TestBed.configureTestingModule({
            imports: [ThyDialogModule, DialogTestModule],
            providers: [
                { provide: Location, useClass: SpyLocation }
                // {
                //     provide: ScrollDispatcher,
                //     useFactory: () => ({
                //         scrolled: () => scrolledSubject.asObservable()
                //     })
                // }
            ]
        });

        TestBed.compileComponents();
    }));

    beforeEach(inject(
        [ThyDialog, Location, OverlayContainer],
        (
            _dialog: ThyDialog,
            _location: Location,
            _overlayContainer: OverlayContainer
        ) => {
            dialog = _dialog;
            mockLocation = _location as SpyLocation;
            overlayContainer = _overlayContainer;
            overlayContainerElement = _overlayContainer.getContainerElement();
        }
    ));

    afterEach(() => {
        overlayContainer.ngOnDestroy();
    });

    beforeEach(() => {
        viewContainerFixture = TestBed.createComponent(
            WithChildViewContainerComponent
        );
        viewContainerFixture.detectChanges();
        testViewContainerRef =
            viewContainerFixture.componentInstance.childViewContainer;
    });

    function getDialogContainerElement() {
        return overlayContainerElement.querySelector(`thy-dialog-container`);
    }

    function assertDialogContentComponent(
        dialogRef: ThyDialogRef<DialogContentComponent>
    ) {
        viewContainerFixture.detectChanges();

        expect(overlayContainerElement.textContent).toContain('Hello Dialog');
        expect(
            dialogRef.componentInstance instanceof DialogContentComponent
        ).toBe(true);
        expect(dialogRef.componentInstance.dialogRef).toBe(dialogRef);

        viewContainerFixture.detectChanges();
        const dialogContainerElement = getDialogContainerElement();
        expect(dialogContainerElement.getAttribute('role')).toBe('dialog');
    }

    it('should open a dialog with a component', () => {
        const dialogRef = dialog.open(DialogContentComponent);
        assertDialogContentComponent(dialogRef);
    });

    it('should open a dialog with a component and viewContainerRef', () => {
        const dialogRef = dialog.open(DialogContentComponent, {
            viewContainerRef: testViewContainerRef
        });
        assertDialogContentComponent(dialogRef);
    });

    it('should open a dialog with a template', () => {
        const templateRefFixture = TestBed.createComponent(
            WithTemplateRefComponent
        );
        templateRefFixture.componentInstance.localValue = 'Bees';
        templateRefFixture.detectChanges();

        const initialState = { value: 'Knees' };

        const dialogRef = dialog.open(
            templateRefFixture.componentInstance.templateRef,
            { initialState }
        );

        viewContainerFixture.detectChanges();

        expect(overlayContainerElement.textContent).toContain(
            'Cheese Bees Knees'
        );
        expect(templateRefFixture.componentInstance.dialogRef).toBe(dialogRef);

        viewContainerFixture.detectChanges();

        const dialogContainerElement = getDialogContainerElement();
        expect(dialogContainerElement.getAttribute('role')).toBe('dialog');

        dialogRef.close();
    });

    it('should emit when dialog opening animation is complete', fakeAsync(() => {
        const dialogRef = dialog.open(DialogContentComponent, {
            viewContainerRef: testViewContainerRef
        });
        const spy = jasmine.createSpy('afterOpened spy');

        dialogRef.afterOpened().subscribe(spy);

        viewContainerFixture.detectChanges();

        // callback should not be called before animation is complete
        expect(spy).not.toHaveBeenCalled();

        // because click-positioner has setTimeout
        // flushMicrotasks();
        flush();
        expect(spy).toHaveBeenCalledTimes(1);
    }));

    it('should use injector from viewContainerRef for DialogInjector', () => {
        const dialogRef = dialog.open(DialogContentComponent, {
            viewContainerRef: testViewContainerRef
        });

        viewContainerFixture.detectChanges();

        const dialogInjector = dialogRef.componentInstance.dialogInjector;

        expect(dialogRef.componentInstance.dialogRef).toBe(dialogRef);
        expect(
            dialogInjector.get<WithViewContainerDirective>(
                WithViewContainerDirective
            )
        ).toBeTruthy(
            'Expected the dialog component to be created with the injector from the viewContainerRef.'
        );
    });

    it('should apply the configured role to the dialog element', () => {
        dialog.open(DialogContentComponent, { role: 'alertdialog' });

        viewContainerFixture.detectChanges();

        const dialogContainerElement = getDialogContainerElement();
        expect(dialogContainerElement.getAttribute('role')).toBe('alertdialog');
    });

    it('should pass initialState', () => {
        const dialogRef = dialog.open(WithInjectedDataDialogComponent, {
            initialState: {
                data: `Hello initialState`
            }
        });
        const instance = dialogRef.componentInstance;
        viewContainerFixture.detectChanges();
        expect(instance.data).toBe('Hello initialState');
    });

    it('should close a dialog and get back a result', fakeAsync(() => {
        const dialogRef = dialog.open(DialogContentComponent, {
            viewContainerRef: testViewContainerRef
        });
        const afterClosedCallback = jasmine.createSpy('afterClosed callback');

        dialogRef.afterClosed().subscribe(afterClosedCallback);
        dialogRef.close('close result');
        viewContainerFixture.detectChanges();

        flush();

        expect(afterClosedCallback).toHaveBeenCalledWith('close result');
        expect(getDialogContainerElement()).toBeNull();
    }));

    it('should close a dialog and get back a result before it is closed', fakeAsync(() => {
        const dialogRef = dialog.open(DialogContentComponent, {
            viewContainerRef: testViewContainerRef
        });

        flush();
        viewContainerFixture.detectChanges();

        // beforeClose should emit before dialog container is destroyed
        const beforeCloseHandler = jasmine
            .createSpy('beforeClose callback')
            .and.callFake(() => {
                expect(getDialogContainerElement()).not.toBeNull(
                    'dialog container exists when beforeClose is called'
                );
            });

        dialogRef.beforeClosed().subscribe(beforeCloseHandler);
        dialogRef.close('Bulbasaur');
        viewContainerFixture.detectChanges();
        flush();

        expect(beforeCloseHandler).toHaveBeenCalledWith('Bulbasaur');
        expect(getDialogContainerElement()).toBeNull();
    }));

    it('should close a dialog via the escape key', fakeAsync(() => {
        dialog.open(DialogContentComponent, {
            viewContainerRef: testViewContainerRef
        });

        dispatchKeyboardEvent(document.body, 'keydown', ESCAPE);
        viewContainerFixture.detectChanges();
        flush();

        expect(getDialogContainerElement()).toBeNull();
    }));

    it('should close from a ViewContainerRef with OnPush change detection', fakeAsync(() => {
        const onPushFixture = TestBed.createComponent(
            WithOnPushViewContainerComponent
        );

        onPushFixture.detectChanges();

        const dialogRef = dialog.open(DialogContentComponent, {
            viewContainerRef: onPushFixture.componentInstance.viewContainerRef
        });

        flushMicrotasks();
        onPushFixture.detectChanges();
        flushMicrotasks();

        expect(
            overlayContainerElement.querySelectorAll('thy-dialog-container')
                .length
        ).toBe(1, 'Expected one open dialog.');

        dialogRef.close();
        flushMicrotasks();
        onPushFixture.detectChanges();
        tick(500);

        expect(
            overlayContainerElement.querySelectorAll('thy-dialog-container')
                .length
        ).toBe(0, 'Expected no open dialogs.');
    }));

    it('should close when clicking on the overlay backdrop', fakeAsync(() => {
        dialog.open(DialogContentComponent, {
            viewContainerRef: testViewContainerRef
        });

        viewContainerFixture.detectChanges();

        const backdrop = overlayContainerElement.querySelector(
            '.cdk-overlay-backdrop'
        ) as HTMLElement;

        backdrop.click();
        viewContainerFixture.detectChanges();
        flush();

        expect(getDialogContainerElement()).toBeFalsy();
    }));

    it('should emit the backdropClick stream when clicking on the overlay backdrop', fakeAsync(() => {
        const dialogRef = dialog.open(DialogContentComponent, {
            viewContainerRef: testViewContainerRef
        });

        const spy = jasmine.createSpy('backdropClick spy');
        dialogRef.backdropClick().subscribe(spy);

        viewContainerFixture.detectChanges();

        const backdrop = overlayContainerElement.querySelector(
            '.cdk-overlay-backdrop'
        ) as HTMLElement;

        backdrop.click();
        expect(spy).toHaveBeenCalledTimes(1);

        viewContainerFixture.detectChanges();
        flush();

        // Additional clicks after the dialog has closed should not be emitted
        backdrop.click();
        expect(spy).toHaveBeenCalledTimes(1);
    }));

    it('should emit the keyboardEvent stream when key events target the overlay', fakeAsync(() => {
        const dialogRef = dialog.open(DialogContentComponent, {
            viewContainerRef: testViewContainerRef
        });
        tick(1);
        const spy = jasmine.createSpy('keyboardEvent spy');
        dialogRef.keydownEvents().subscribe(spy);

        viewContainerFixture.detectChanges();

        const backdrop = overlayContainerElement.querySelector(
            '.cdk-overlay-backdrop'
        ) as HTMLElement;
        const container = getDialogContainerElement();
        dispatchKeyboardEvent(document.body, 'keydown', A);
        dispatchKeyboardEvent(document.body, 'keydown', A, backdrop);
        dispatchKeyboardEvent(document.body, 'keydown', A, container);

        expect(spy).toHaveBeenCalledTimes(3);
    }));
});
