declare namespace API {
    export interface DirTreeNode {
        id: number;
        name: string; // 目录名称/素材名称
        parentId: number;
        isMaterial: boolean; // true：素材  false：目录
        file?: string[]; // 素材下载地址
        fileDetailRespList?: {
            fileUrl: string;
            id: number;
            key: string;
            name: string;
            postfix: string;
        }[];
        children: DirTreeNode[];
    }

    export interface DirListItem {
        id: number;
        name: string; // 目录名称/素材名称
        parentId: number;
        isMaterial: boolean; // true：素材  false：目录
        file?: string[]; // 素材下载地址
        fileDetailRespList?: {
            fileUrl: string;
            id: number;
            key: string;
            name: string;
            postfix: string;
        }[];
        level: number;
    }

    type FileDetailRespList = {
        /** 文件地址 */
        fileUrl?: string;
        /** 主键id */
        id?: number;
        /** 文件唯一标识 */
        key?: string;
        /** 文件名称 */
        name?: string;
        /** 文件后缀,文件地址 */
        postfix?: string;
    };

    type TenderSourceDto = {
        /** 分类id */
        categoryId?: number;
        /** 分类名称 */
        categoryName?: string;
        /** 文件详情对象 */
        fileDetailRespList?: FileDetailRespList[];
        /** 主键id */
        id?: number;
        /** 修改人 */
        modifier?: string;
        /** 修改人id */
        modifierId?: number;
        /** 修改人名称 */
        modifierName?: string;
        /** 修改时间 */
        modifyTime?: string;
        /** 分类名称 */
        name?: string;
        /** 文件类型 WORD:文档 PIC：图片 */
        typeCode?: string;
        /** 文件类型 WORD:文档 PIC：图片 */
        typeName?: string;
    };

    export interface TenderTocNode {
        tocName?: string;
        tocFlag?: boolean;
        tenderSourceDto?: TenderSourceDto;
    }

    export interface TenderTocItem {
        tocName?: string;
        tocFlag?: boolean;
        tenderSourceDto?: TenderSourceDto;
        level?: number;
    }

    export interface TenderTocTreeNode {
        tocName?: string;
        tocFlag?: boolean;
        tenderSourceDto?: TenderSourceDto;
        level?: number;
        children?: TenderDirTreeNode[];
    }

    type TenderTocType = {
        children?: TenderTocType[];
        t?: TenderTocNode;
    }

    interface UploadResult {
        code?: number;
        data?: {
            fileUrl?: string;
            id?: number;
            key?: string;
            name?: string;
            postfix?: string;
        };
        msg?: string;
    };

    interface CreateCallback {
        /** 文件地址 */
        fileKey?: string;
        /** 标书id不能为空 */
        id: number;
        /** 状态 */
        status: string;
      };
}