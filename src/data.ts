import {ChatCompletionRequestMessage, ChatCompletionRequestMessageRoleEnum} from "openai";
import {User} from "./interface";
import {isTokenOverLimit} from "./utils.js";

/**
 * 使用内存作为数据库
 */

class DB {
  private static data: User[] = [];

  /**
   * 添加一个用户, 如果用户已存在则返回已存在的用户
   * @param username
   */
  public addUser(username: string): User {
    let existUser = DB.data.find((user) => user.username === username);
    if (existUser) {
      console.log(`用户${username}已存在`);
      return existUser;
    }
    const newUser: User = {
      username: username,
      chatMessage: [
        {
          role: ChatCompletionRequestMessageRoleEnum.System,
          content: "Midjourney是一个基于diffusion图像生成技术开发的文字生成图片的软件。你扮演一个Midjourney的画师，你需要调用MJ机器人进行作画，作画操作方式是按照我提供的回答格式进行答复。根据你对diffusion技术的理解，编写我需要的【画面描述内容】，你的描述内容必须为英语，并少于50字。你的回答应遵循以下结构：@Ai绘图机器人 mj 【画面描述内容】。不包含其他内容。从现在开始，如果我的输入里面没有（mj）这个关键词，你都只回答（好的），并且没有其他内容"
        },
        {
          role: ChatCompletionRequestMessageRoleEnum.User,
          content: "一间地中海风格的糖果屋，没有人物，高清图"
        },
        {
          role: ChatCompletionRequestMessageRoleEnum.Assistant,
          content: "@Ai绘图机器人 mj A Mediterranean-style candy house with bright blue and white walls, a red roof, and colorful candy decorations. The house is surrounded by lush green trees and bushes. The image is high-definition."
        },
        {
          role: ChatCompletionRequestMessageRoleEnum.User,
          content: "皮克斯人物，一个兔子公主"
        },
        {
          role: ChatCompletionRequestMessageRoleEnum.Assistant,
          content: "@Ai绘图机器人 mj A red-haired princess with a bow and arrow, accompanied by her three mischievous younger brothers."
        }
      ],
    };
    DB.data.push(newUser);
    return newUser;
  }

  /**
   * 根据用户名获取用户, 如果用户不存在则添加用户
   * @param username
   */
  public getUserByUsername(username: string): User {
    return DB.data.find((user) => user.username === username) || this.addUser(username);
  }

  /**
   * 获取用户的聊天记录
   * @param username
   */
  public getChatMessage(username: string): Array<ChatCompletionRequestMessage> {
    return this.getUserByUsername(username).chatMessage;
  }

  /**
   * 设置用户的prompt
   * @param username
   * @param prompt
   */
  public setPrompt(username: string, prompt: string): void {
    const user = this.getUserByUsername(username);
    if (user) {
      user.chatMessage.find(
        (msg) => msg.role === ChatCompletionRequestMessageRoleEnum.System
      )!.content = prompt;
    }
  }

  /**
   * 添加用户输入的消息
   * @param username
   * @param message
   */
  public addUserMessage(username: string, message: string): void {
    const user = this.getUserByUsername(username);
    if (user) {
      while (isTokenOverLimit(user.chatMessage)){
        // 删除从第2条开始的消息(因为第一条是prompt)
        user.chatMessage.splice(1,1);
      }
      user.chatMessage.push({
        role: ChatCompletionRequestMessageRoleEnum.User,
        content: message,
      });
    }
  }

  /**
   * 添加ChatGPT的回复
   * @param username
   * @param message
   */
  public addAssistantMessage(username: string, message: string): void {
    const user = this.getUserByUsername(username);
    if (user) {
      while (isTokenOverLimit(user.chatMessage)){
        // 删除从第2条开始的消息(因为第一条是prompt)
        user.chatMessage.splice(1,1);
      }
      user.chatMessage.push({
        role: ChatCompletionRequestMessageRoleEnum.Assistant,
        content: message,
      });
    }
  }

  /**
   * 清空用户的聊天记录, 并将prompt设置为默认值
   * @param username
   */
  public clearHistory(username: string): void {
    const user = this.getUserByUsername(username);
    if (user) {
      user.chatMessage = [
        {
          role: ChatCompletionRequestMessageRoleEnum.System,
          content: "You are a helpful assistant."
        }
      ];
    }
  }

  public getAllData(): User[] {
    return DB.data;
  }
}
const DBUtils = new DB();
export default DBUtils;
