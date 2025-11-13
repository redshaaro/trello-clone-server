const { board, user, invitation, board_member } = require("../../models");
const nodemailer = require("nodemailer");
const { Op } = require("sequelize");

const jwt = require("jsonwebtoken");

// ---------------- GET USER BOARDS ----------------
const getUserBoards = async (req, res) => {
  try {
    const userId = req.user.id;

    // 1. Boards the user owns
    const ownedBoards = await board.findAll({
      where: { user_id: userId },
    });

    // 2. Find all board IDs where the user is a member
    const memberRecords = await board_member.findAll({
      where: { user_id: userId, role: { [Op.ne]: "OWNER" } },
      attributes: ["board_id"],

    });
    console.log(memberRecords)

    const memberBoardIds = memberRecords.map((rec) => rec.board_id);

    // 3. Fetch boards using those IDs
    let memberBoards = [];
    if (memberBoardIds.length > 0) {
      memberBoards = await board.findAll({
        where: { id: memberBoardIds },
      });
    }

    res.json({
      ownedBoards,
      memberBoards,
    });
  } catch (error) {
    console.error("Error fetching user boards:", error);
    res.status(500).json({ error: "Failed to fetch boards" });
  }
};

// ---------------- CREATE BOARD ----------------
const createBoard = async (req, res) => {
  const { name } = req.body;
  
  if (!req.user.id) return res.status(401).json({ message: "Unauthorized access" });
  
  if (!name || name.trim().length === 0) {
    return res.status(400).json({ message: "Board name is required" });
  }

  if (name.length > 100) {
    return res.status(400).json({ message: "Board name must be less than 100 characters" });
  }

  try {
    const createdboard = await board.create({
      name: name.trim(),
      user_id: req.user.id,
    });

    // Owner should automatically be in board_members as OWNER
    await board_member.create({
      board_id: createdboard.id,
      user_id: req.user.id,
      role: "OWNER",
    });

    res.status(201).json({ message: "Board created successfully", createdboard });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Couldn't create new board" });
  }
};

// ---------------- GET BOARD BY ID ----------------
const getBoardById = async (req, res) => {
  const { boardId } = req.params;
  const found = req.board; // Board already validated by checkBoardAccess middleware

  try {
    res.status(200).json({ message: "success", board: found });
  } catch (err) {
    console.error("Error fetching board:", err);
    res.status(500).json({ message: "Couldn't fetch board" });
  }
};

// ---------------- EDIT BOARD ----------------
const editBoard = async (req, res) => {
  const { boardId } = req.params;
  const { name } = req.body;

  if (!req.user.id) return res.status(401).json({ message: "Unauthorized access" });
  if (!name || name.trim().length === 0) return res.status(400).json({ message: "Board name is required" });
  
  if (name.length > 100) {
    return res.status(400).json({ message: "Board name must be less than 100 characters" });
  }

  try {
    // Check if user is owner
    const foundBoard = await board.findByPk(boardId);
    if (!foundBoard) return res.status(404).json({ message: "Board not found" });

    // Check if user is owner or admin
    const isOwner = foundBoard.user_id === req.user.id;
    const memberRecord = await board_member.findOne({
      where: { board_id: boardId, user_id: req.user.id }
    });

    if (!isOwner && (!memberRecord || memberRecord.role !== 'ADMIN')) {
      return res.status(403).json({ message: "Forbidden: Only board owners and admins can edit the board name" });
    }

    await board.update({ name: name.trim() }, { where: { id: boardId } });
    const updatedBoard = await board.findByPk(boardId);

    res.status(200).json({ message: "Success", editedboard: updatedBoard });
  } catch (err) {
    console.error("Error updating board:", err);
    res.status(500).json({ message: "Couldn't update board" });
  }
};

// ---------------- DELETE BOARD ----------------
const deleteBoard = async (req, res) => {
  const { boardId } = req.params;

  if (!req.user.id) return res.status(401).json({ message: "Unauthorized access" });

  try {
    // Only board owner can delete the board
    const foundBoard = await board.findByPk(boardId);
    if (!foundBoard) return res.status(404).json({ message: "Board not found" });

    if (foundBoard.user_id !== req.user.id) {
      return res.status(403).json({ message: "Forbidden: Only the board owner can delete the board" });
    }

    await board.destroy({ where: { id: boardId } });

    res.status(200).json({ message: "Success", deletedboard: boardId });
  } catch (err) {
    console.error("Error deleting board:", err);
    res.status(500).json({ message: "Couldn't delete board" });
  }
};

// ---------------- INVITE TO BOARD ----------------
const inviteToBoard = async (req, res) => {
  const { boardId } = req.params;
  const { invitedEmail, role } = req.body;
  const { sendBoardInvitationEmail } = require('../utils/sendEmail');

  // Validation
  if (!boardId) return res.status(400).json({ message: "Board id is required" });
  if (!invitedEmail) return res.status(400).json({ message: "Invited email is required" });
  
  // Validate email format
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(invitedEmail)) {
    return res.status(400).json({ message: "Invalid email format" });
  }
  
  // Validate role
  if (!role || !['VIEWER', 'MEMBER', 'ADMIN'].includes(role)) {
    return res.status(400).json({ message: "Invalid role. Must be VIEWER, MEMBER, or ADMIN" });
  }

  try {
    // 1. Check if board exists
    const foundBoard = await board.findByPk(boardId);
    if (!foundBoard) return res.status(404).json({ message: "Board not found" });

    // 2. Check inviter's permission (must be OWNER or ADMIN)
    const inviterMembership = await board_member.findOne({
      where: { user_id: req.user.id, board_id: boardId },
      attributes: ["role"],
    });

    if (!inviterMembership || (inviterMembership.role !== "OWNER" && inviterMembership.role !== "ADMIN")) {
      return res.status(403).json({ message: "You are not authorized to invite members to this board" });
    }

    // 3. Check if user already exists and is already a member
    const existingUser = await user.findOne({
      where: { email: invitedEmail },
      attributes: ["id", "username", "email"],
    });

    if (existingUser) {
      // Check if already a member
      const existingMember = await board_member.findOne({
        where: { user_id: existingUser.id, board_id: boardId },
      });
      if (existingMember) {
        return res.status(400).json({ message: "User is already a board member" });
      }
    }

    // 4. Check for existing pending invitation
    const existingInvitation = await invitation.findOne({
      where: { 
        board_id: boardId, 
        invitee_email: invitedEmail,
        status: 'PENDING',
        expires_at: { [Op.gt]: new Date() }
      }
    });

    if (existingInvitation) {
      return res.status(400).json({ message: "An invitation has already been sent to this email" });
    }

    // 5. Generate invitation token
    const token = jwt.sign(
      { boardId, inviteeEmail: invitedEmail, role }, 
      process.env.JWT_SECRET, 
      { expiresIn: "7d" } // Changed to 7 days to give users more time
    );

    // 6. Save invitation
    await invitation.create({
      board_id: boardId,
      inviter_id: Number(req.user.id),
      invitee_email: invitedEmail,
      role,
      token_hash: token,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      status: "PENDING",
    });

    // 7. Send email using utility function
    try {
      await sendBoardInvitationEmail(
        invitedEmail,
        req.user.username,
        foundBoard.name,
        token,
        role
      );
      
      res.status(200).json({ 
        message: "Invitation sent successfully",
        details: {
          email: invitedEmail,
          role: role,
          boardName: foundBoard.name
        }
      });
    } catch (emailError) {
      // If email fails, delete the invitation
      await invitation.destroy({
        where: { token_hash: token }
      });
      
      console.error("Email sending failed:", emailError);
      return res.status(500).json({ 
        message: "Failed to send invitation email. Please check email configuration.",
        error: emailError.message
      });
    }

  } catch (err) {
    console.error("Invite to board error:", err);
    res.status(500).json({ message: "Something went wrong", error: err.message });
  }
};

// ---------------- ACCEPT INVITATION ----------------
const acceptInvitation = async (req, res) => {
  const { token } = req.query;

  if (!token) return res.status(400).json({ message: "Token is required" });

  try {
    const invite = await invitation.findOne({
      where: { token_hash: token },
    });

    if (!invite) return res.status(404).json({ message: "Invitation does not exist" });

    if (invite.status !== "PENDING") {
      return res.status(400).json({ message: `Invitation already ${invite.status}` });
    }

    if (new Date() > invite.expires_at) {
      await invite.update({ status: "EXPIRED" });
      return res.status(400).json({ message: "Invitation expired" });
    }

    const foundUser = await user.findOne({ where: { email: invite.invitee_email } });
    if (!foundUser) return res.status(404).json({ message: "User not found" });

    await board_member.create({
      board_id: invite.board_id,
      user_id: foundUser.id,
      role: invite.role,
    });

    await invite.update({ status: "ACCEPTED" });

    res.status(200).json({ message: "Invitation accepted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ---------------- DECLINE INVITATION ----------------
const declineInvitation = async (req, res) => {
  const { token } = req.query;
  if (!token) return res.status(400).json({ message: "Token is required" });

  try {
    const invite = await invitation.findOne({ where: { token_hash: token } });
    if (!invite) return res.status(404).json({ message: "Invitation does not exist" });

    if (invite.status !== "PENDING") {
      return res.status(400).json({ message: `Invitation already ${invite.status}` });
    }

    await invite.update({ status: "DECLINED" });
    res.status(200).json({ message: "Invitation declined" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ---------------- CANCEL INVITATION ----------------
const cancelInvitation = async (req, res) => {
  const { token } = req.query;
  if (!token) return res.status(400).json({ message: "Token is required" });

  try {
    const invite = await invitation.findOne({ where: { token_hash: token } });
    if (!invite) return res.status(404).json({ message: "Invitation does not exist" });

    if (invite.status !== "PENDING") {
      return res.status(400).json({ message: `Invitation already ${invite.status}` });
    }

    await invite.update({ status: "CANCELLED" });
    res.status(200).json({ message: "Invitation cancelled" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ---------------- GET BOARD MEMBERS ----------------
const getBoardMembers = async (req, res) => {
  const { boardId } = req.params;

  try {
    // Check if user has access to the board
    const foundBoard = await board.findByPk(boardId);
    if (!foundBoard) return res.status(404).json({ message: "Board not found" });

    const isOwner = foundBoard.user_id === req.user.id;
    const isMember = await board_member.findOne({
      where: { board_id: boardId, user_id: req.user.id }
    });

    if (!isOwner && !isMember) {
      return res.status(403).json({ message: "Forbidden: You don't have access to this board" });
    }

    // Get all board members with user details
    const members = await board_member.findAll({
      where: { board_id: boardId },
      include: [{
        model: user,
        attributes: ['id', 'username', 'email']
      }],
      attributes: ['id', 'role', 'createdAt']
    });

    res.status(200).json({ message: "Success", members });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Couldn't fetch board members" });
  }
};

// ---------------- REMOVE BOARD MEMBER ----------------
const removeBoardMember = async (req, res) => {
  const { boardId, memberId } = req.params;

  try {
    const foundBoard = await board.findByPk(boardId);
    if (!foundBoard) return res.status(404).json({ message: "Board not found" });

    // Check if requester is owner or admin
    const isOwner = foundBoard.user_id === req.user.id;
    const requesterMembership = await board_member.findOne({
      where: { board_id: boardId, user_id: req.user.id }
    });

    if (!isOwner && (!requesterMembership || !['ADMIN', 'OWNER'].includes(requesterMembership.role))) {
      return res.status(403).json({ message: "Forbidden: Only owners and admins can remove members" });
    }

    // Find the member to remove
    const memberToRemove = await board_member.findOne({
      where: { board_id: boardId, user_id: memberId }
    });

    if (!memberToRemove) {
      return res.status(404).json({ message: "Board member not found" });
    }

    // Can't remove the owner
    if (memberToRemove.role === 'OWNER') {
      return res.status(403).json({ message: "Forbidden: Cannot remove the board owner" });
    }

    // Admins can't remove other admins unless they're the owner
    if (memberToRemove.role === 'ADMIN' && !isOwner) {
      return res.status(403).json({ message: "Forbidden: Only the owner can remove admins" });
    }

    await memberToRemove.destroy();

    res.status(200).json({ message: "Member removed successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Couldn't remove board member" });
  }
};

// ---------------- UPDATE MEMBER ROLE ----------------
const updateMemberRole = async (req, res) => {
  const { boardId, memberId } = req.params;
  const { role } = req.body;

  if (!role || !['ADMIN', 'MEMBER', 'VIEWER'].includes(role)) {
    return res.status(400).json({ message: "Invalid role. Must be ADMIN, MEMBER, or VIEWER" });
  }

  try {
    const foundBoard = await board.findByPk(boardId);
    if (!foundBoard) return res.status(404).json({ message: "Board not found" });

    // Only owner can change roles
    if (foundBoard.user_id !== req.user.id) {
      return res.status(403).json({ message: "Forbidden: Only the board owner can change member roles" });
    }

    const memberToUpdate = await board_member.findOne({
      where: { board_id: boardId, user_id: memberId }
    });

    if (!memberToUpdate) {
      return res.status(404).json({ message: "Board member not found" });
    }

    // Can't change owner role
    if (memberToUpdate.role === 'OWNER') {
      return res.status(403).json({ message: "Forbidden: Cannot change the owner's role" });
    }

    await memberToUpdate.update({ role });

    res.status(200).json({ message: "Member role updated successfully", member: memberToUpdate });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Couldn't update member role" });
  }
};

// ---------------- GET PENDING INVITATIONS ----------------
const getPendingInvitations = async (req, res) => {
  try {
    const userEmail = req.user.email;

    if (!userEmail) {
      return res.status(400).json({ message: "User email not set. Please update your profile to receive invitations." });
    }

    const invitations = await invitation.findAll({
      where: {
        invitee_email: userEmail,
        status: 'PENDING',
        expires_at: { [Op.gt]: new Date() }
      },
      attributes: ['id', 'board_id', 'invitee_email', 'role', 'token_hash', 'status', 'expires_at', 'createdAt'], // Include token_hash!
      include: [
        {
          model: board,
          attributes: ['id', 'name']
        },
        {
          model: user,
          as: 'inviter',
          attributes: ['id', 'username', 'email']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    // Map to include token field for frontend compatibility
    const invitationsWithToken = invitations.map(inv => ({
      id: inv.id,
      board_id: inv.board_id,
      invitee_email: inv.invitee_email,
      role: inv.role,
      token: inv.token_hash, // Frontend expects 'token', not 'token_hash'
      status: inv.status,
      expires_at: inv.expires_at,
      createdAt: inv.createdAt,
      board: inv.board,
      inviter: inv.inviter
    }));

    res.status(200).json({ message: "Success", invitations: invitationsWithToken });
  } catch (err) {
    console.error("Get invitations error:", err);
    res.status(500).json({ message: "Couldn't fetch invitations" });
  }
};

// ---------------- LEAVE BOARD ----------------
const leaveBoard = async (req, res) => {
  const { boardId } = req.params;

  try {
    const foundBoard = await board.findByPk(boardId);
    if (!foundBoard) return res.status(404).json({ message: "Board not found" });

    // Can't leave if you're the owner
    if (foundBoard.user_id === req.user.id) {
      return res.status(403).json({ message: "Forbidden: Board owner cannot leave the board. Delete the board instead." });
    }

    // Find and remove member record
    const memberRecord = await board_member.findOne({
      where: { board_id: boardId, user_id: req.user.id }
    });

    if (!memberRecord) {
      return res.status(404).json({ message: "You are not a member of this board" });
    }

    await memberRecord.destroy();

    res.status(200).json({ message: "Successfully left the board" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Couldn't leave board" });
  }
};

// ---------------- UPDATE BOARD BACKGROUND ----------------
const updateBoardBackground = async (req, res) => {
  const { boardId } = req.params;
  const { background_url } = req.body;

  if (!req.user.id) return res.status(401).json({ message: "Unauthorized access" });

  try {
    // Check if board exists
    const foundBoard = await board.findByPk(boardId);
    if (!foundBoard) return res.status(404).json({ message: "Board not found" });

    // Check if user is owner or admin
    const isOwner = foundBoard.user_id === req.user.id;
    const memberRecord = await board_member.findOne({
      where: { board_id: boardId, user_id: req.user.id }
    });

    if (!isOwner && (!memberRecord || !['ADMIN', 'OWNER'].includes(memberRecord.role))) {
      return res.status(403).json({ message: "Forbidden: Only board owners and admins can change the background" });
    }

    // Update background (null is allowed to remove background)
    await board.update({ background_url }, { where: { id: boardId } });
    const updatedBoard = await board.findByPk(boardId);

    res.status(200).json({ 
      message: "Board background updated successfully", 
      board: updatedBoard 
    });
  } catch (err) {
    console.error("Error updating board background:", err);
    res.status(500).json({ message: "Couldn't update board background" });
  }
};

module.exports = {
  getUserBoards,
  createBoard,
  getBoardById,
  editBoard,
  deleteBoard,
  inviteToBoard,
  acceptInvitation,
  declineInvitation,
  cancelInvitation,
  getPendingInvitations,
  getBoardMembers,
  removeBoardMember,
  updateMemberRole,
  leaveBoard,
  updateBoardBackground,
};
