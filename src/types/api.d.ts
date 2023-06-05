declare namespace API {
  export interface DirTreeNode {
    id: number;
    name: string; // 目录名称/素材名称
    parentId: number;
    isMaterial: boolean; // true：素材  false：目录
    file?: string[]; // 素材下载地址
    fileDtoList?: {
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
    fileDtoList?: {
      fileUrl: string;
      id: number;
      key: string;
      name: string;
      postfix: string;
    }[];
    level: number;
  }

  type FileDtoList = {
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
    /** 主键id */
    id?: number;
    /** 分类名称 */
    name?: string;
    /** 分类id */
    categoryId?: number;
    /** 文件详情对象 */
    fileDtoList?: FileDtoList[];
    /** 文件类型 WORD:文档 PIC：图片 */
    typeCode?: string;
  };

  export interface TenderTocNode {
    tocName?: string;
    sourceFlag?: boolean;
    tenderSourceId?: number;
  }

  export interface TenderTocItem {
    tocName?: string;
    sourceFlag?: boolean;
    tenderSourceId?: number;
    tenderSourceDto?: TenderSourceDto;
    level?: number;
  }

  export interface TenderTocTreeNode {
    tocName?: string;
    sourceFlag?: boolean;
    tenderSourceId?: number;
    tenderSourceDto?: TenderSourceDto;
    level?: number;
    children?: TenderDirTreeNode[];
  }

  type TenderTocType = {
    children?: TenderTocType[];
    t?: TenderTocNode;
  };

  type LoginUser = {
    userId: number;
    userName: string;
    staffCode: string;
    staffName: string;
    companyCode: string;
    companyName: string;
    token?: string;
    Authorization?: string;
  };

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
  }

  interface CreateCallback {
    /** 文件地址 */
    fileKey?: string;
    /** 标书id不能为空 */
    id: number;
    /** 状态 */
    status: string;
  }

  interface PreStyle {
    margin: MarginStyle;
    header: HeaderStyle[];
  }
  interface MarginStyle {
    left: number;
    right: number;
    top: number;
    bottom: number;
  }
  interface HeaderStyle {
    level: string;
    fontFamily: string;
    fontSize: number;
    lineHeight: number;
    alignment: string;
  }
}
