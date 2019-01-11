import { Component, OnInit, ElementRef, Renderer2, HostListener, Output, EventEmitter, HostBinding, Input, NgZone } from '@angular/core';
import { mimeTypeConvert } from './util';

@Component({
    selector: '[thyFileDrop]',
    template: `
        <ng-content></ng-content>
    `
})
export class ThyFileDropComponent implements OnInit {
    _state = {
        isDragOver: false,
        isCustomClassName: false,
        acceptType: '',
        isNeedCheckTypeAccept: false
    };

    @Input() thyFileDropClassName: string;

    @Input()
    set thyAcceptType(value: Array<string> | string) {
        this._state.acceptType = mimeTypeConvert(value);
        this._state.isNeedCheckTypeAccept = !!value;
    }

    @Output() thyOnDrop = new EventEmitter();

    @HostBinding('class.drop-over')
    get isDragOver() {
        return this._state.isDragOver;
    }

    constructor(private elementRef: ElementRef, private renderer: Renderer2, private ngZone: NgZone) {}

    ngOnInit(): void {
        this._state.isCustomClassName = !!this.thyFileDropClassName;
        this.ngZone.runOutsideAngular(() => {
            this.renderer.listen(this.elementRef.nativeElement, 'dragenter', this.dragenter.bind(this));
            this.renderer.listen(this.elementRef.nativeElement, 'dragover', this.dragover.bind(this));
            this.renderer.listen(this.elementRef.nativeElement, 'dragleave', this.dragleave.bind(this));
            this.renderer.listen(this.elementRef.nativeElement, 'drop', this.drop.bind(this));
        });
    }

    // @HostListener('dragenter', ['$event'])
    dragenter(event: any) {
        event.preventDefault();
        this.ngZone.run(() => {
            this._backToDefaultState();
            let isDataTransferAllAccept = true;
            // if (this._state.isNeedCheckTypeAccept) {
            //     if (event.dataTransfer.items.length > 0) {
            //         for (let index = 0; index < event.dataTransfer.items.length; index++) {
            //             const n = event.dataTransfer.items[index];
            //             if (!n.type || this._state.acceptType.indexOf(n.type) === -1 || n.kind === 'string') {
            //                 isDataTransferAllAccept = false;
            //                 return;
            //             }
            //         }
            //     }
            // }
            if (this._state.isNeedCheckTypeAccept) {
                isDataTransferAllAccept = true;
            } else {
                if (event.dataTransfer.items.length > 0) {
                    for (var index = 0; index < event.dataTransfer.items.length; index++) {
                        var n = event.dataTransfer.items[index];
                        if (!n.type || n.kind !== 'file') {
                            isDataTransferAllAccept = false;
                            return;
                        }
                    }
                }
            }
            if (isDataTransferAllAccept) {
                this._state.isDragOver = true;
            }
            this._toggleDropOverClassName();
        });
    }

    // @HostListener('dragover', ['$event'])
    dragover(event: any) {
        event.preventDefault();
    }

    // @HostListener('dragleave', ['$event'])
    dragleave(event: any) {
        this.ngZone.run(() => {
            if (!this.elementRef.nativeElement.contains(event.fromElement)) {
                this._backToDefaultState();
                this._toggleDropOverClassName();
            }
        });
    }

    // @HostListener('drop', ['$event'])
    drop(event: any) {
        event.preventDefault();
        this.ngZone.run(() => {
            if (!this._state.isDragOver) {
                console.error('ngx-tethys Error: Uploaded files that do not support extensions.');
                return;
            }

            this.thyOnDrop.emit({
                files: event.dataTransfer.files,
                nativeEvent: event
            });
            this._backToDefaultState();
            this._toggleDropOverClassName();
        });
    }

    private _toggleDropOverClassName() {
        if (this._state.isCustomClassName) {
            if (this._state.isDragOver) {
                this.renderer.addClass(this.elementRef.nativeElement, this.thyFileDropClassName);
            } else {
                this.renderer.removeClass(this.elementRef.nativeElement, this.thyFileDropClassName);
            }
        }
    }

    private _backToDefaultState() {
        this._state.isDragOver = false;
    }
}
