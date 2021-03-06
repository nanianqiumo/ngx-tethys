import { Component } from '@angular/core';
import { DemoSlideContentComponent } from './slide-content.component';
import { ThySlideService } from '../../../../../src/slide/slide.service';

@Component({
    selector: 'demo-slide-section',
    templateUrl: './slide-section.component.html'
})
export class DemoSlideSectionComponent {

    public thySlideFrom = 'right';

    public thySlideClass = 'thy-slide';

    public hasBackdrop = true;

    public apiThySlideParameters = [
        {
            property: 'key',
            description: 'Slide 的唯一标识，相同 key 控制是否弹出 slide',
            type: 'ElementRef | HTMLElement',
            default: 'null'
        },
        {
            property: 'from',
            description: 'slide 进场的方向,可选 left | right | top | bottom',
            type: 'string',
            default: 'right'
        },
        {
            property: 'class',
            description: 'slide 上的样式,可以控制 Slide 的 height,width,top,left...',
            type: 'string',
            default: 'thy-slide'
        },
        {
            property: 'hasBackdrop',
            description: 'slide 弹出时，是否有幕布.',
            type: 'boolean',
            default: 'true'
        }
    ];

    public apiThySlideHeaderParameters = [
        {
            property: 'thyTitle',
            description: 'Slide 标题',
            type: 'string',
            default: 'null'
        },
        {
            property: 'thyIcon',
            description: 'Slide 标题的图标',
            type: 'string',
            default: 'null'
        },
    ];

    constructor(
        private thySlideService: ThySlideService
    ) { }

    showSlide(key) {
        this.thySlideService.show(DemoSlideContentComponent, {
            key: key,
            from: this.thySlideFrom, // 'left','right','top','bottom'
            class: this.thySlideClass,
            hasBackdrop: this.hasBackdrop,
            initialState: { name: 'slide' }
        });
    }

}
