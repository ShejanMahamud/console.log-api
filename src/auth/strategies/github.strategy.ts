import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-github2';

@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy, 'github') {
  constructor(private config: ConfigService) {
    super({
      clientID: config.get<string>('GITHUB_CLIENT_ID') as string,
      clientSecret: config.get<string>('GITHUB_CLIENT_SECRET') as string,
      callbackURL: config.get<string>('GITHUB_CALLBACK_URL') as string,
      scope: ['user:email'],
    });
  }
  validate(
    _accessToken: string,
    _refreshToken: string,
    profile: Profile,
  ): unknown {
    const { username, emails, displayName, photos } = profile;
    const email = emails?.[0]?.value;
    const photo = photos?.[0]?.value;
    return {
      username,
      email,
      profilePicture: photo,
      name: displayName,
    };
  }
}
