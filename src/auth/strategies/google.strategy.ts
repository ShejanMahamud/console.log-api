import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy, VerifyCallback } from 'passport-google-oauth20';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    //inject config service
    private config: ConfigService,
  ) {
    //pass values to parent class
    super({
      clientID: config.get<string>('GOOGLE_CLIENT_ID') as string,
      clientSecret: config.get<string>('GOOGLE_CLIENT_SECRET') as string,
      callbackURL: config.get<string>('GOOGLE_CALLBACK_URL') as string,
      scope: ['email', 'profile'],
    });
  }

  //validate user
  validate(
    _accessToken: string,
    _refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ): void {
    const { name, emails, photos } = profile;
    //formatted user
    const user = {
      email: emails?.[0]?.value,
      username:
        name?.givenName?.toLowerCase() + '_' + name?.familyName?.toLowerCase(),
      name: name?.givenName + ' ' + name?.familyName,
      profilePicture: photos?.[0]?.value,
    };
    //forward to callback
    done(null, user);
  }
}
