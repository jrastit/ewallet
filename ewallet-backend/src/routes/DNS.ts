import StatusCodes from 'http-status-codes';
import { Request, Response } from 'express';

import { validationResult } from 'express-validator'

import { paramMissingError } from '@shared/constants';

const { BAD_REQUEST, CREATED, OK } = StatusCodes;

const util = require('util');
const exec = util.promisify(require('child_process').exec);

export interface TypedRequestBody<T> extends Express.Request {
  body: T
}

/**
 * Get contract address from domain name.
 *
 * @param req
 * @param res
 * @returns
 */
export async function getOwner(req: Request, res: Response) {
  try {
    validationResult(req).throw();
    const { stdout, stderr } = await exec('sh ../ewallet-script/get_owner.sh ' + req.query.domain)
    const domain_txt_nft4domains_address = stdout.replace(/\n/g, '');
    return res.status(OK).json({
      domain: {
        txt: {
          nft4domains: {
            owner: domain_txt_nft4domains_address
          }
        }
      }
    })
  } catch (err) {
    console.log(err)
    res.status(400).send("domain error");
  }
}

export async function postOwner(req: TypedRequestBody<{ domain: string }>, res: Response) {
  try {
    validationResult(req).throw();
    console.log(req.body.domain)
    const { stdout, stderr } = await exec('sh ../ewallet-script/get_owner.sh ' + req.body.domain)
    const domain_txt_nft4domains_address = stdout.replace(/\n/g, '');
    return res.status(OK).json({
      domain: {
        txt: {
          nft4domains: {
            owner: domain_txt_nft4domains_address
          }
        }
      }
    })
  } catch (err) {
    console.log(err)
    res.status(400).send("domain error");
  }

}
