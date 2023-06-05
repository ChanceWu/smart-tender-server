import { AlignmentType, IBaseParagraphStyleOptions } from "docx";

export const getListFromTree = (
  nodes: API.TenderTocTreeNode[],
  map: Record<string, API.TenderSourceDto>,
  level: number,
): API.TenderTocItem[] => {
  const list: API.TenderTocItem[] = [];

  nodes.forEach((node) => {
    const { children, ...rest } = node;
    const item: API.TenderTocItem = {
      ...rest,
      level: level,
    };

    if (
      node.tenderSourceId &&
      map[String(node.tenderSourceId)] &&
      map[String(node.tenderSourceId)]?.fileDtoList
    ) {
      const { fileDtoList, ...restTenderSourceDto } =
        map[String(node.tenderSourceId)];
      fileDtoList.forEach((v) => {
        list.push({
          ...item,
          tenderSourceDto: {
            ...restTenderSourceDto,
            fileDtoList: [v],
          },
        });
      });
    } else {
      list.push(item);
    }

    if (node.children.length > 0) {
      const childrenList = getListFromTree(node.children, map, level + 1);
      list.push(...childrenList);
    }
  });

  return list;
};

export const formatTreeData = (
  data: API.TenderTocType[],
): API.TenderTocTreeNode[] => {
  return data.map((v) => {
    return {
      ...v.t,
      children: v.children?.length ? formatTreeData(v.children) : [],
    };
  });
};

export const getHeaderStyleFromList = (styles?: API.HeaderStyle[]) => {
  const obj: Record<string, API.HeaderStyle> = {};
  (styles ?? []).forEach((v) => {
    obj[v.level] = v;
  });
  return obj;
};


export const getDefaultHeaderStyle = (headerStyle: Record<string, API.HeaderStyle>) => {
  const obj: Record<string, IBaseParagraphStyleOptions> = {};
  ['Heading1', 'Heading2', 'Heading3', 'Heading4', 'Heading5', 'Heading6'].forEach(v => {
    obj[v.toLowerCase()] = {
      run: {
        font: headerStyle[v]?.fontFamily ?? 'Calibri',
        size: headerStyle[v]?.fontSize ?? 52,
        bold: true,
        color: '000000',
      },
      paragraph: {
        alignment: (headerStyle[v]?.alignment ??
          AlignmentType.RIGHT) as AlignmentType,
        spacing: {
          line: headerStyle[v]?.lineHeight ?? 720,
        }
      }
    }
  })
  console.log('getDefaultHeaderStyle ', JSON.stringify(obj))
  return obj
}