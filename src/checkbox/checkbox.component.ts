import { Component, forwardRef, HostBinding, HostListener, Input, ElementRef } from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';
import { ThyTranslate } from '../shared';
import { inputValueToBoolean } from '../util/helpers';

import { ThyFormCheckBaseComponent } from '../shared';

const noop = () => {
};

@Component({
    selector: '[thyCheckbox]',
    templateUrl: './checkbox.component.html',
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => ThyCheckboxComponent),
            multi: true
        }
    ]
})
export class ThyCheckboxComponent extends ThyFormCheckBaseComponent {
    constructor(
        thyTranslate: ThyTranslate
    ) {
        super(thyTranslate);
    }

    change() {
        this.updateValue(!this._innerValue);
    }
}
