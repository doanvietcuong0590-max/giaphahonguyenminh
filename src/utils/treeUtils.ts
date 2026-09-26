import { Member } from '../types';

/**
 * Convert any positive integer to Roman numeral
 */
export function toRoman(num: number): string {
  if (num <= 0 || !Number.isInteger(num)) return `${num}`;
  const lookup: Record<string, number> = {
    M: 1000,
    CM: 900,
    D: 500,
    CD: 400,
    C: 100,
    XC: 90,
    L: 50,
    XL: 40,
    X: 10,
    IX: 9,
    V: 5,
    IV: 4,
    I: 1,
  };
  let roman = '';
  let n = num;
  for (const i in lookup) {
    while (n >= lookup[i]) {
      roman += i;
      n -= lookup[i];
    }
  }
  return roman;
}

/**
 * Get dynamic list of available generations based on existing members
 * Always provides options beyond the current max generation (e.g. maxGen + 5, minimum 10)
 */
export function getAvailableGenerations(members: Member[]): number[] {
  const maxGen = members.length > 0 ? Math.max(...members.map(m => m.generation || 1), 1) : 5;
  const count = Math.max(maxGen + 4, 10);
  return Array.from({ length: count }, (_, i) => i + 1);
}

/**
 * Generates an informative title for a given generation number
 */
export function getGenerationTitle(gen: number): string {
  const roman = toRoman(gen);
  switch (gen) {
    case 1:
      return `Đời thứ ${roman} - Khởi Tổ`;
    case 2:
      return `Đời thứ ${roman} - Tiền Nhân / Các Chi`;
    case 3:
      return `Đời thứ ${roman} - Trung Hưng`;
    case 4:
      return `Đời thứ ${roman} - Tiền Bối Đương Thời`;
    case 5:
      return `Đời thứ ${roman} - Thế Hệ Trưởng Thành`;
    case 6:
      return `Đời thứ ${roman} - Hậu Duệ Kế Nghiệp`;
    case 7:
      return `Đời thứ ${roman} - Mầm Non Dòng Tộc`;
    default:
      return `Đời thứ ${roman} (Thế hệ ${gen})`;
  }
}

export interface TreeNode {
  member: Member;
  spouses: Member[];
  children: TreeNode[];
}

/**
 * Build hierarchical tree data structure starting from root ancestors (generation 1 or members without parents)
 */
export function buildFamilyTree(members: Member[]): TreeNode[] {
  if (!members || members.length === 0) return [];

  const memberMap = new Map<string, Member>();
  members.forEach(m => memberMap.set(m.id, m));

  // Find root members: generation 1, or those with no parents recorded in members list
  let rootMembers = members.filter(m => m.generation === 1 || (m.parentIds.length === 0 && m.rank !== 'dau' && m.rank !== 're'));
  
  if (rootMembers.length === 0) {
    const minGen = Math.min(...members.map(m => m.generation));
    rootMembers = members.filter(m => m.generation === minGen);
  }

  const visited = new Set<string>();

  function buildNode(member: Member): TreeNode {
    visited.add(member.id);

    // Find spouses
    const spouses = member.spouseIds
      .map(id => memberMap.get(id))
      .filter((s): s is Member => Boolean(s));

    // Find children either via member.childIds or child's parentIds including this member
    const childrenIds = new Set<string>();
    (member.childIds || []).forEach(id => childrenIds.add(id));
    members.forEach(m => {
      if (m.parentIds && m.parentIds.includes(member.id)) {
        childrenIds.add(m.id);
      }
    });

    const children: TreeNode[] = [];
    childrenIds.forEach(cId => {
      const childMember = memberMap.get(cId);
      if (childMember && !visited.has(childMember.id)) {
        children.push(buildNode(childMember));
      }
    });

    // Sort children by birthYear or rank
    children.sort((a, b) => {
      const rankOrder: Record<string, number> = { truong: 1, thu: 2, dau: 3, re: 4, khac: 5 };
      const rA = rankOrder[a.member.rank] || 99;
      const rB = rankOrder[b.member.rank] || 99;
      if (rA !== rB) return rA - rB;
      const yearA = typeof a.member.birthYear === 'number' ? a.member.birthYear : parseInt(String(a.member.birthYear)) || 0;
      const yearB = typeof b.member.birthYear === 'number' ? b.member.birthYear : parseInt(String(b.member.birthYear)) || 0;
      return yearA - yearB;
    });

    return {
      member,
      spouses,
      children,
    };
  }

  return rootMembers.map(root => buildNode(root));
}
