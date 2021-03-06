import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'demo-pagination',
    templateUrl: './pagination.component.html',
    styleUrls: ['./pagination.scss']
})
export class DemoPaginationComponent implements OnInit {
    public page_ = 8;

    public apiThyPaginationParameters = [
        {
            property: 'ngModel',
            description: `双向绑定值,当前页数`,
            type: 'Number',
            default: '1'
        },
        {
            property: 'itemsPerPage',
            description: `每页条目数量`,
            type: 'Number',
            default: '20'
        },
        {
            property: 'totalItems',
            description: `总页数 与 totalPages 二选一传入`,
            type: 'Number',
            default: '-'
        },
        {
            property: 'totalPages',
            description: `总条目 与 totalItems 二选一传入`,
            type: 'Number',
            default: '-'
        },
        {
            property: 'thySize',
            description: `分页的长度 固定选项 ：'xs' | 'sm' | 'md'`,
            type: 'ThyPaginationMaxSize',
            default: 'md'
        },
        {
            property: 'thyJump',
            description: `显示跳转组件`,
            type: 'Boolean',
            default: 'true'
        },
        {
            property: 'disabled',
            description: `禁用`,
            type: 'Boolean',
            default: 'false'
        }
    ];
    ngOnInit() {}
}
