import OAuth2Server, {
  AuthorizationCode,
  Client,
  Token,
  User,
  Falsey,
  Callback,
} from 'oauth2-server';
import { ClientModel } from './../../database/index';
import { TokenModel } from './../../database/index';
import { UserModel } from './../../database/index';
import {
  IBlockchainTransaction,
  BlockchainTransaction,
} from './../../database/index';
import { transformClient, transformToken } from './utils/utility';
import { RefreshToken } from './type-interface/auth.interface';

const oauthModel = {
  getAccessToken: async (accessToken: string): Promise<Token | Falsey> => {
    try {
      const token = await TokenModel.findOne({ accessToken })
        .populate('client user')
        .exec();

      return token ? transformToken(token) : false;
    } catch (error) {
      console.error('Error retrieving access token:', error);
      return false;
    }
  },

  getClient: async (
    clientId: string,
    clientSecret: string
  ): Promise<Client | Falsey> => {
    try {
      const client = await ClientModel.findOne({
        clientId,
        clientSecret,
      }).exec();
      return client ? transformClient(client) : false;
    } catch (error) {
      console.error('Error retrieving client:', error);
      return false;
    }
  },

  saveToken: async (
    token: Token,
    client: Client,
    user: User,
    callback?: Callback<Token>
  ): Promise<Token | Falsey> => {
    try {
      const tokenDocument = new TokenModel({
        accessToken: token.accessToken,
        accessTokenExpiresAt: token.accessTokenExpiresAt,
        refreshToken: token.refreshToken,
        refreshTokenExpiresAt: token.refreshTokenExpiresAt,
        client: client.id,
        user: user.id,
      });

      const savedToken = await tokenDocument.save();
      const transformedToken: any = savedToken ? transformToken(savedToken) : false;

      if (callback) callback(null, transformedToken);

      return transformedToken;
    } catch (error) {
      console.error('Error saving token:', error);
      if (callback) callback(error);
      return false;
    }
  },

  getUser: async (
    username: string,
    password: string
  ): Promise<User | Falsey> => {
    try {
      const user = await UserModel.findOne({ username, password }).exec();
      return user || false;
    } catch (error) {
      console.error('Error retrieving user:', error);
      return false;
    }
  },

  getAuthorizationCode: async (
    code: string
  ): Promise<AuthorizationCode | Falsey | any> => {
    try {
      const authCode = await TokenModel.findOne({
        authorizationCode: code || '',
      })
        .populate('client user')
        .exec();
      return authCode || false;
    } catch (error) {
      console.error('Error retrieving authorization code:', error);
      return false;
    }
  },

  saveAuthorizationCode: async (
    code: AuthorizationCode,
    client: Client,
    user: User,
    callback?: Callback<AuthorizationCode>
  ): Promise<AuthorizationCode | Falsey | any> => {
    try {
      const authCodeDocument = new TokenModel({
        authorizationCode: code.authorizationCode || '',
        expiresAt: code.expiresAt,
        redirectUri: code.redirectUri,
        client: client.id,
        user: user.id,
      });

      const savedAuthCode = await authCodeDocument.save();
      const transformedAuthCode: any = savedAuthCode || false;

      if (callback) callback(null, transformedAuthCode);

      return transformedAuthCode;
    } catch (error) {
      console.error('Error saving authorization code:', error);
      if (callback) callback(error);
      return false;
    }
  },

  revokeAuthorizationCode: async (
    code: AuthorizationCode,
    callback?: Callback<boolean>
  ): Promise<boolean> => {
    try {
      const result = await TokenModel.deleteOne({
        authorizationCode: code.authorizationCode,
      }).exec();
      const isRevoked = result.deletedCount === 1;

      if (callback) callback(null, isRevoked);

      return isRevoked;
    } catch (error) {
      console.error('Error revoking authorization code:', error);
      if (callback) callback(error);
      return false;
    }
  },

  getRefreshToken: async (refreshToken: string): Promise<RefreshToken | Falsey> => {
    try {
      const token = await TokenModel.findOne({ refreshToken })
        .populate('client user')
        .exec() as any;

      return token ? transformToken(token) as RefreshToken : false;
    } catch (error) {
      console.error('Error retrieving refresh token:', error);
      return false;
    }
  },

  revokeToken: async (
    token: Token,
    callback?: Callback<boolean>
  ): Promise<boolean> => {
    try {
      const result = await TokenModel.deleteOne({
        refreshToken: token.refreshToken,
      }).exec();
      const isRevoked = result.deletedCount === 1;

      if (callback) callback(null, isRevoked);

      return isRevoked;
    } catch (error) {
      console.error('Error revoking refresh token:', error);
      if (callback) callback(error);
      return false;
    }
  },

  verifyScope: async (token: Token, scope: string | string[]): Promise<boolean> => {
    if (!token.scope) {
      return false;
    }

    const tokenScopes = Array.isArray(token.scope) ? token.scope : token.scope.split(' ');
    const requestedScopes = Array.isArray(scope) ? scope : scope.split(' ');
    return requestedScopes.every((s) => tokenScopes.includes(s));
  },
};

const oauth = new OAuth2Server({
  model: oauthModel,
});


const blockchainService = {
  saveBlockchainTransaction: async (
    transaction: IBlockchainTransaction,
    callback?: Callback<IBlockchainTransaction>
  ): Promise<IBlockchainTransaction | Falsey | any> => {
    try {
      const transactionDocument = new BlockchainTransaction(transaction);
      const savedTransaction = await transactionDocument.save();
      const transformedTransaction = savedTransaction || false;

      if (callback) callback(null, transformedTransaction);

      return transformedTransaction;
    } catch (error) {
      console.error('Error saving blockchain transaction:', error);
      if (callback) callback(error);
      return false;
    }
  },

  getBlockchainTransaction: async (
    transactionId: string,
    callback?: Callback<IBlockchainTransaction>
  ): Promise<IBlockchainTransaction | Falsey> => {
    try {
      const transaction = await BlockchainTransaction.findOne({
        transactionId,
      }).exec();

      const transformedTransaction = transaction || false;

      if (callback) callback(null, transformedTransaction as any);

      return transformedTransaction;
    } catch (error) {
      console.error('Error retrieving blockchain transaction:', error);
      if (callback) callback(error);
      return false;
    }
  },
};


export { oauth, blockchainService };
