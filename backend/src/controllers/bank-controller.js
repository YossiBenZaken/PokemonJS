import { query } from "../config/database.js";

// Get user's bank information
export const getBankInfo = async (req, res) => {
  try {
    const { userId } = req.params;

    // Get user info
    const [user] = await query(`
      SELECT g.username, g.silver, g.rank, g.clan, r.gold
      FROM gebruikers g
      LEFT JOIN accounts r ON g.acc_id = r.acc_id
      WHERE g.user_id = ?
    `, [userId]);

    if (!user) {
      return res.status(404).json({ success: false, message: "Usuário não encontrado" });
    }

    let clanInfo = null;
    if (user.clan) {
      // Get clan info (assuming you have a clan system)
      const [clan] = await query(
        "SELECT silvers, golds FROM clans WHERE id = ?", 
        [user.clan]
      );
      clanInfo = clan;
    }

    return res.json({
      success: true,
      data: {
        user: {
          username: user.username,
          silver: user.silver || 0,
          gold: user.gold || 0,
          rank: user.rank || 0,
          clan: user.clan
        },
        clan: clanInfo
      }
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Erro ao carregar informações do banco",
      error: error.message
    });
  }
};

// Transfer money to another player
export const transferToPlayer = async (req, res) => {
  try {
    const { userId, receiver, amount, currency } = req.body;

    // Input validation
    if (!receiver || !amount || !currency) {
      return res.status(400).json({ 
        success: false, 
        message: "Dados obrigatórios não fornecidos" 
      });
    }

    const transferAmount = Math.floor(Number(amount));

    // Validate amount
    if (transferAmount <= 0 || !Number.isInteger(transferAmount)) {
      return res.status(400).json({ 
        success: false, 
        message: "Quantidade inválida" 
      });
    }

    // Validate currency
    if (currency !== 'silver' && currency !== 'gold') {
      return res.status(400).json({ 
        success: false, 
        message: "Moeda deve ser silver ou gold" 
      });
    }

    // Get sender info
    const [sender] = await query(`
      SELECT g.user_id, g.username, g.silver, g.rank, g.acc_id, r.gold
      FROM gebruikers g
      LEFT JOIN accounts r ON g.acc_id = r.acc_id
      WHERE g.user_id = ?
    `, [userId]);

    if (!sender) {
      return res.status(404).json({ success: false, message: "Usuário não encontrado" });
    }

    // Check if trying to send to themselves
    if (receiver.toLowerCase() === sender.username.toLowerCase()) {
      return res.status(400).json({ 
        success: false, 
        message: "Não é possível enviar para si mesmo" 
      });
    }

    // Check rank for gold transfers
    if (currency === 'gold' && sender.rank < 8) {
      return res.status(400).json({ 
        success: false, 
        message: "Você não tem rank suficiente para transferir Gold (mínimo: 8)" 
      });
    }

    // Check minimum amount for silver
    if (currency === 'silver' && transferAmount < 10) {
      return res.status(400).json({ 
        success: false, 
        message: "Valor mínimo para transferência de Silver é 10" 
      });
    }

    // Check if receiver exists
    const [receiverUser] = await query(
      "SELECT user_id, username, acc_id FROM gebruikers WHERE username = ?",
      [receiver]
    );

    if (!receiverUser) {
      return res.status(404).json({ 
        success: false, 
        message: "Usuário destinatário não encontrado" 
      });
    }

    // Check if sender has enough funds
    if (currency === 'silver') {
      if (sender.silver < transferAmount) {
        return res.status(400).json({ 
          success: false, 
          message: "Silver insuficiente" 
        });
      }
    } else { // gold
      if (sender.gold < transferAmount) {
        return res.status(400).json({ 
          success: false, 
          message: "Gold insuficiente" 
        });
      }
    }

    // Perform the transfer
    if (currency === 'silver') {
      // Deduct from sender
      await query(
        "UPDATE gebruikers SET silver = silver - ? WHERE user_id = ?",
        [transferAmount, userId]
      );
      
      // Add to receiver
      await query(
        "UPDATE gebruikers SET silver = silver + ? WHERE username = ?",
        [transferAmount, receiver]
      );
    } else { // gold
      // Deduct from sender
      await query(
        "UPDATE accounts SET gold = gold - ? WHERE acc_id = ?",
        [transferAmount, sender.acc_id]
      );
      
      // Add to receiver
      await query(
        "UPDATE accounts SET gold = gold + ? WHERE acc_id = ?",
        [transferAmount, receiverUser.acc_id]
      );
    }

    // Create notification for receiver
    const currencyIcon = currency === 'silver' ? 'silver' : 'gold';
    const eventMessage = `<img src="/images/icons/blue.png" width="16" height="16" /> <a href="./profile&player=${sender.username}">${sender.username}</a> שלח לך <img src="/images/icons/${currencyIcon}.png" title="${currency}" width="16" height="16"> ${transferAmount.toLocaleString()} ${currency}.`;
    
    await query(`
      INSERT INTO gebeurtenis (datum, ontvanger_id, bericht, gelezen) 
      VALUES (NOW(), ?, ?, '0')
    `, [receiverUser.user_id, eventMessage]);

    // Log the transaction
    await query(`
      INSERT INTO bank_logs (date, sender, reciever, amount, what) 
      VALUES (NOW(), ?, ?, ?, ?)
    `, [sender.username, receiver, transferAmount, currency]);

    return res.json({
      success: true,
      message: `Transferência de ${transferAmount.toLocaleString()} ${currency} para ${receiver} realizada com sucesso!`
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Erro ao realizar transferência",
      error: error.message
    });
  }
};

// Transfer money to clan
export const transferToClan = async (req, res) => {
  try {
    const { userId, amount, currency } = req.body;

    // Input validation
    if (!amount || !currency) {
      return res.status(400).json({ 
        success: false, 
        message: "Dados obrigatórios não fornecidos" 
      });
    }

    const transferAmount = Math.floor(Number(amount));

    // Validate amount
    if (transferAmount <= 0 || !Number.isInteger(transferAmount)) {
      return res.status(400).json({ 
        success: false, 
        message: "Quantidade inválida" 
      });
    }

    // Validate currency
    if (currency !== 'silver' && currency !== 'gold') {
      return res.status(400).json({ 
        success: false, 
        message: "Moeda deve ser silver ou gold" 
      });
    }

    // Get user info
    const [user] = await query(`
      SELECT g.user_id, g.username, g.silver, g.rank, g.acc_id, g.clan, r.gold
      FROM gebruikers g
      LEFT JOIN accounts r ON g.acc_id = r.acc_id
      WHERE g.user_id = ?
    `, [userId]);

    if (!user) {
      return res.status(404).json({ success: false, message: "Usuário não encontrado" });
    }

    if (!user.clan) {
      return res.status(400).json({ 
        success: false, 
        message: "Você não está em um clã" 
      });
    }

    // Check rank for gold transfers
    if (currency === 'gold' && user.rank < 8) {
      return res.status(400).json({ 
        success: false, 
        message: "Você não tem rank suficiente para transferir Gold (mínimo: 8)" 
      });
    }

    // Check minimum amount for silver
    if (currency === 'silver' && transferAmount < 10) {
      return res.status(400).json({ 
        success: false, 
        message: "Valor mínimo para transferência de Silver é 10" 
      });
    }

    // Check if user has enough funds
    if (currency === 'silver') {
      if (user.silver < transferAmount) {
        return res.status(400).json({ 
          success: false, 
          message: "Silver insuficiente" 
        });
      }
    } else { // gold
      if (user.gold < transferAmount) {
        return res.status(400).json({ 
          success: false, 
          message: "Gold insuficiente" 
        });
      }
    }

    // Perform the transfer
    if (currency === 'silver') {
      // Deduct from user
      await query(
        "UPDATE gebruikers SET silver = silver - ? WHERE user_id = ?",
        [transferAmount, userId]
      );
      
      // Add to clan
      await query(
        "UPDATE clans SET silvers = silvers + ? WHERE id = ?",
        [transferAmount, user.clan]
      );
    } else { // gold
      // Deduct from user
      await query(
        "UPDATE accounts SET gold = gold - ? WHERE acc_id = ?",
        [transferAmount, user.acc_id]
      );
      
      // Add to clan
      await query(
        "UPDATE clans SET golds = golds + ? WHERE id = ?",
        [transferAmount, user.clan]
      );
    }

    // Log the transaction (optional)
    await query(`
      INSERT INTO bank_logs (date, sender, reciever, amount, what) 
      VALUES (NOW(), ?, 'CLAN', ?, ?)
    `, [user.username, transferAmount, currency]);

    return res.json({
      success: true,
      message: `Transferência de ${transferAmount.toLocaleString()} ${currency} para o clã realizada com sucesso!`
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Erro ao realizar transferência para o clã",
      error: error.message
    });
  }
};

// Get transaction history
export const getTransactionHistory = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    // Get user info
    const [user] = await query(
      "SELECT username FROM gebruikers WHERE user_id = ?",
      [userId]
    );

    if (!user) {
      return res.status(404).json({ success: false, message: "Usuário não encontrado" });
    }

    const offset = (page - 1) * limit;

    // Get transaction history
    const transactions = await query(`
      SELECT * FROM bank_logs 
      WHERE sender = ? OR reciever = ? 
      ORDER BY date DESC 
      LIMIT ? OFFSET ?
    `, [user.username, user.username, parseInt(limit), offset]);

    // Get total count
    const [countResult] = await query(`
      SELECT COUNT(*) as total FROM bank_logs 
      WHERE sender = ? OR reciever = ?
    `, [user.username, user.username]);

    return res.json({
      success: true,
      data: {
        transactions,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: countResult.total,
          pages: Math.ceil(countResult.total / limit)
        }
      }
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Erro ao carregar histórico de transações",
      error: error.message
    });
  }
};