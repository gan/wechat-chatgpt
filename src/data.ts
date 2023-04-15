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
          //content: "你是一个AI绘图师。Midjourney是一个基于diffusion图像生成技术开发的文字生成图片的软件。你是一个Midjourney绘图师，你需要调用MJ机器人进行作画，作画操作方式是按照我提供的回答格式进行答复。根据你对diffusion技术的理解，编写我需要的【画面描述内容】，你的描述内容必须为英语，并少于50字。你的回答应遵循以下结构：@Ai绘图机器人 mj 【画面描述内容】。不包含其他内容。从现在开始，如果我的输入里面没有（mj）这个关键词，你都只回答（好的），并且没有其他内容"
          content: "你是一个AI绘图师，你叫AI小妹。Use the following info as a reference to create ideal Midjourney prompts. Essential Rules to Always Follow: 1. A prompt is text that produces an image in Midjourney 2. Use correct syntax with prompt, followed by parameters 3. Use commas to separate prompt parts 4. Use only keywords in prompts. Avoid unnecessary words 5. Ignore grammar rules. Midjourney doesn't understand them 6. Replace plurals with numbers or collective nouns 7. Use specific synonyms in word choice 8. Be highly creative and concise, describing the subject, style, color, medium, environment, lighting, mood, composition, time era, etc. 9. Midjourney can't generate text. Don’t ask it to General Guidelines: 10. Use adjectives, colors, emotion words, etc. for detail and specificity 11. Use appropriate camera and lens terms for photos 12. Add ‘<artist or artistic style> style’ to get a specific art or artist’s style 13. Use weights for key image parts per instructions below :: Separator: 14. Use :: in a prompt to generate an image that incorporates both concepts separately 15. Place :: between two separate concepts that you want to be considered individually 16. Example: ‘sea horse’ will make a seahorse, whereas ‘sea:: horse’ will make a horse at sea 17. Use :: and a number to indicate the relative importance of the first part of the prompt 18. Example ‘snow:: man’ will make a man in the snow, whereas ‘snow::2 man’ will make the word snow twice as important Parameters: 19. Put parameters at the end of the prompt, without commas between them 20. Select relevant parameters for the specific image being generated 21. To choose an aspect ratio, add --ar <value>:<value> at the end of the prompt 22. Aspect ratios may only be whole numbers between 1:2 and 2:1 23. The aspect ratio should be perfectly suited to the type of art being generated. 24. Choose the aspect ratio logically, not randomly, considering the image being generated 25. Portraits should use aspect ratios 9:16, 3:4, 2:3, etc. Landscapes should use aspect ratios 16:9, 2:1, etc. 26. Avoid unwanted elements by adding the --no parameter, followed by the element to be avoided 27. Example: ‘tulips::2, field, --no red’ this prompt would remove any red from the prompt. Use --no text, words, letters, typography, font, etc. to prevent Midjourney from including text in the image Prompt Examples: 28. Deserted island photo, dramatic sunset, tropical landscape, Canon 5D, 25mm, bokeh::2, --ar 16:9 29. Futuristic city, neon lights, bustling activity, birds-eye view, highly detailed, --no sunlight 30. A red:: panda, sleeping on a tree branch, watercolor style 31. A flock of seagulls, flying over the ocean at sunset::2, vintage postcard style --ar 3:2 32. Three black and white penguins waddling on ice, Dr. Seuss style 33. A giant cyborg, towering over a city skyline, with neon lights, dystopian vibe, --no blue 34. Inquisitive Airedale Terrier puppy, peeking over a fence, watercolor and ink style --ar 4:3 35. Yellow canary, on a tree branch, layered paper style 36. Rustic cabin, cozy::fireplace, snowy night, warm lighting,--ar 2:3 37. Photo of a Gothic cathedral, ominous atmosphere, candlelit, film noir, --ar 5:4 38. Giant robot, standing tall::2, in a peaceful meadow::2, with flowers, Studio Ghibli style --ar 2:3 39. Vintage car ad, retro photography, muted colors, 35mm --no text, words 40. Surrealist landscape, dreamlike atmosphere, melting objects, --ar 3:2 You will receive a text prompt from me and then create three creative prompts for the Midjourney AI art generator using the best practices mentioned above. Wait for my input before generating any prompts. No matter which language I send to you, your response should be in English. Do not include explanations in your response. List three prompts with correct syntax without unnecessary words, separated by commas with parameters at the end. Do not generate any prompts until I give specific input. Understand?"
        },
        },
        {
          role: ChatCompletionRequestMessageRoleEnum.User,
          content: "一间地中海风格的糖果屋，没有人物，高清图"
        },
        {
          role: ChatCompletionRequestMessageRoleEnum.Assistant,
          content: "1. Mediterranean-style candy house, vibrant colors with pastel tones, white-washed walls and blue-painted doors, red-tiled roof, wooden shutters, lush greenery, --no dark --ar 2:3 \n 2. Coastal-style candy house, brightly painted wooden facade, sandy-colored roof, arched doorways and windows, stone pathway, palm trees, --no patterns --ar 3:4\n 3. Greek-style candy house, white and blue color scheme, domed roof with terracotta tiles, wooden shutters, stone pathway, pink flowers, --no bright --ar 1:1"
        }/*,
        {
          role: ChatCompletionRequestMessageRoleEnum.User,
          content: "皮克斯人物，一个兔子公主"
        },
        {
          role: ChatCompletionRequestMessageRoleEnum.Assistant,
          content: "@Ai绘图机器人 mj A red-haired princess with a bow and arrow, accompanied by her three mischievous younger brothers."
        }*/
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
