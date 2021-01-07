import { xmlToJson } from "./xml-to-json";
import { Message } from "../../src/proto/padlocal_pb";

interface AppMsgXmlSchema {
  msg: {
    appmsg: {
      title: string;
      des: string;
      type: string;
      url: string;
      appattach: {
        totallen: string;
        attachid: string;
        emoticonmd5: string;
        fileext: string;
        cdnattachurl: string;
        cdnthumbaeskey: string;
        aeskey: string;
        encryver: string;
        islargefilemsg: string;
      };
      thumburl: string;
      md5: any;
      recorditem?: string;
    };
    fromusername: string;
    appinfo: {
      appname: any;
    };
  };
}

export enum AppMessageType {
  Text = 1,
  Img = 2,
  Audio = 3,
  Video = 4,
  Url = 5,
  Attach = 6,
  Open = 7,
  Emoji = 8,
  VoiceRemind = 9,
  ScanGood = 10,
  Good = 13,
  Emotion = 15,
  CardTicket = 16,
  RealtimeShareLocation = 17,
  ChatHistory = 19,
  MiniProgram = 33,
  MiniProgramApp = 36, // this is forwardable mini program
  GroupNote = 53,
  Transfers = 2000,
  RedEnvelopes = 2001,
  ReaderType = 100001,
}

export interface AppAttachPayload {
  totallen?: number;
  attachid?: string;
  emoticonmd5?: string;
  fileext?: string;
  cdnattachurl?: string;
  aeskey?: string;
  cdnthumbaeskey?: string;
  encryver?: number;
  islargefilemsg: number;
}

export interface AppMessagePayload {
  des?: string;
  thumburl?: string;
  title: string;
  url: string;
  appattach?: AppAttachPayload;
  type: AppMessageType;
  md5?: string;
  fromusername?: string;
  recorditem?: string;
}

export async function appMessageParser(message: Message.AsObject): Promise<AppMessagePayload> {
  const content = message.content.trim();
  let tryXmlText = content;
  if (!/^<msg>.*/.test(content)) {
    tryXmlText = content.replace(/^[^\n]+\n/, "");
  }

  const appMsgXml: AppMsgXmlSchema = await xmlToJson(tryXmlText);
  const { title, des, url, thumburl, type, md5, recorditem } = appMsgXml.msg.appmsg;
  let appattach: AppAttachPayload | undefined;
  const tmp = appMsgXml.msg.appmsg.appattach;
  if (tmp) {
    appattach = {
      aeskey: tmp.aeskey,
      attachid: tmp.attachid,
      cdnattachurl: tmp.cdnattachurl,
      cdnthumbaeskey: tmp.cdnthumbaeskey,
      emoticonmd5: tmp.emoticonmd5,
      encryver: (tmp.encryver && parseInt(tmp.encryver, 10)) || 0,
      fileext: tmp.fileext,
      islargefilemsg: (tmp.islargefilemsg && parseInt(tmp.islargefilemsg, 10)) || 0,
      totallen: (tmp.totallen && parseInt(tmp.totallen, 10)) || 0,
    };
  }
  return {
    appattach,
    des,
    md5,
    recorditem,
    thumburl,
    title,
    type: parseInt(type, 10),
    url,
  };
}
