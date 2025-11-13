// utils/permissions.js
const { board, board_member } = require("../../models");

/**
 * Check if user has access to a board (as owner or member)
 */
const hasboardAccess = async (userId, boardId) => {
  // Check if owner
  const ownedBoard = await board.findOne({
    where: { id: boardId, user_id: userId }
  });
  if (ownedBoard) return { hasAccess: true, role: 'OWNER', board: ownedBoard };

  // Check if member
  const memberRecord = await board_member.findOne({
    where: { board_id: boardId, user_id: userId }
  });
  if (memberRecord) {
    const boardInfo = await board.findByPk(boardId);
    return { hasAccess: true, role: memberRecord.role, board: boardInfo };
  }

  return { hasAccess: false, role: null, board: null };
};

/**
 * Check if user can modify board (OWNER or ADMIN)
 */
const canModifyBoard = (role) => {
  return ['OWNER', 'ADMIN'].includes(role);
};

/**
 * Check if user can create/edit content (OWNER, ADMIN, or MEMBER)
 */
const canEditContent = (role) => {
  return ['OWNER', 'ADMIN', 'MEMBER'].includes(role);
};

/**
 * Check if user is board owner
 */
const isOwner = (role) => {
  return role === 'OWNER';
};

/**
 * Check if user can invite members (OWNER or ADMIN)
 */
const canInviteMembers = (role) => {
  return ['OWNER', 'ADMIN'].includes(role);
};

/**
 * Check if user can remove members (OWNER or ADMIN)
 */
const canRemoveMembers = (role) => {
  return ['OWNER', 'ADMIN'].includes(role);
};

module.exports = {
  hasboardAccess,
  canModifyBoard,
  canEditContent,
  isOwner,
  canInviteMembers,
  canRemoveMembers
};

