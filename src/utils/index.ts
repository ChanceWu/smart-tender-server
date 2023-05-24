export const getListFromTree = (
  nodes: API.TenderTocTreeNode[],
  level: number,
): API.TenderTocItem[] => {
  const list: API.TenderTocItem[] = [];

  nodes.forEach((node) => {
    const { children, ...rest } = node;
    const item: API.TenderTocItem = {
      ...rest,
      level: level,
    };

    if (node.tenderSourceDto?.fileDetailRespList) {
      const { fileDetailRespList, ...restTenderSourceDto } = node.tenderSourceDto;
      fileDetailRespList.forEach(v => {
        list.push({
          ...item,
          tenderSourceDto: {
            ...restTenderSourceDto,
            fileDetailRespList: [v]
          },
        })
      })
    } else {
      list.push(item);
    }


    if (node.children.length > 0) {
      const childrenList = getListFromTree(node.children, level + 1);
      list.push(...childrenList);
    }
  });

  return list;
};

export const formatTreeData = (data: API.TenderTocType[]): API.TenderTocTreeNode[] => {
  return data.map((v) => {
    return {
      ...v.t,
      children: v.children?.length ? formatTreeData(v.children) : [],
    };
  });
};