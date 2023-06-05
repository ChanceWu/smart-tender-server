export class CreateDocxMergeDto {
  name: string;
  id: number;
  tenderToc: API.TenderTocType[];
  tenderCreateSourceDtoMap: Record<string, API.TenderSourceDto>;
  loginUser: API.LoginUser;
  preStyle?: API.PreStyle;
}
