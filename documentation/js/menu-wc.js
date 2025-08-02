'use strict';

customElements.define('compodoc-menu', class extends HTMLElement {
    constructor() {
        super();
        this.isNormalMode = this.getAttribute('mode') === 'normal';
    }

    connectedCallback() {
        this.render(this.isNormalMode);
    }

    render(isNormalMode) {
        let tp = lithtml.html(`
        <nav>
            <ul class="list">
                <li class="title">
                    <a href="index.html" data-type="index-link">consolelog documentation</a>
                </li>

                <li class="divider"></li>
                ${ isNormalMode ? `<div id="book-search-input" role="search"><input type="text" placeholder="Type to search"></div>` : '' }
                <li class="chapter">
                    <a data-type="chapter-link" href="index.html"><span class="icon ion-ios-home"></span>Getting started</a>
                    <ul class="links">
                        <li class="link">
                            <a href="overview.html" data-type="chapter-link">
                                <span class="icon ion-ios-keypad"></span>Overview
                            </a>
                        </li>
                        <li class="link">
                            <a href="index.html" data-type="chapter-link">
                                <span class="icon ion-ios-paper"></span>README
                            </a>
                        </li>
                                <li class="link">
                                    <a href="dependencies.html" data-type="chapter-link">
                                        <span class="icon ion-ios-list"></span>Dependencies
                                    </a>
                                </li>
                                <li class="link">
                                    <a href="properties.html" data-type="chapter-link">
                                        <span class="icon ion-ios-apps"></span>Properties
                                    </a>
                                </li>
                    </ul>
                </li>
                    <li class="chapter modules">
                        <a data-type="chapter-link" href="modules.html">
                            <div class="menu-toggler linked" data-bs-toggle="collapse" ${ isNormalMode ?
                                'data-bs-target="#modules-links"' : 'data-bs-target="#xs-modules-links"' }>
                                <span class="icon ion-ios-archive"></span>
                                <span class="link-name">Modules</span>
                                <span class="icon ion-ios-arrow-down"></span>
                            </div>
                        </a>
                        <ul class="links collapse " ${ isNormalMode ? 'id="modules-links"' : 'id="xs-modules-links"' }>
                            <li class="link">
                                <a href="modules/AppModule.html" data-type="entity-link" >AppModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#controllers-links-module-AppModule-f39dbef7ca929e4ed4c2dc1df61933f0cf674e5057513a8d85c6050ada971bc3c3fe75f76dc6c659b6151e1543e2c21de8ea4b98a1fbe133f292900fb907a5af"' : 'data-bs-target="#xs-controllers-links-module-AppModule-f39dbef7ca929e4ed4c2dc1df61933f0cf674e5057513a8d85c6050ada971bc3c3fe75f76dc6c659b6151e1543e2c21de8ea4b98a1fbe133f292900fb907a5af"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-AppModule-f39dbef7ca929e4ed4c2dc1df61933f0cf674e5057513a8d85c6050ada971bc3c3fe75f76dc6c659b6151e1543e2c21de8ea4b98a1fbe133f292900fb907a5af"' :
                                            'id="xs-controllers-links-module-AppModule-f39dbef7ca929e4ed4c2dc1df61933f0cf674e5057513a8d85c6050ada971bc3c3fe75f76dc6c659b6151e1543e2c21de8ea4b98a1fbe133f292900fb907a5af"' }>
                                            <li class="link">
                                                <a href="controllers/AppController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AppController</a>
                                            </li>
                                        </ul>
                                    </li>
                            </li>
                            <li class="link">
                                <a href="modules/AuthModule.html" data-type="entity-link" >AuthModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#controllers-links-module-AuthModule-a01145e04a338b23378329421cab9df0b92848660cbb2497ab9b4b4430966a8d71d7d3ebaa7d70a5ba173de2d5a9a88805a6d186fc115d38a0d9807e6fb7fb28"' : 'data-bs-target="#xs-controllers-links-module-AuthModule-a01145e04a338b23378329421cab9df0b92848660cbb2497ab9b4b4430966a8d71d7d3ebaa7d70a5ba173de2d5a9a88805a6d186fc115d38a0d9807e6fb7fb28"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-AuthModule-a01145e04a338b23378329421cab9df0b92848660cbb2497ab9b4b4430966a8d71d7d3ebaa7d70a5ba173de2d5a9a88805a6d186fc115d38a0d9807e6fb7fb28"' :
                                            'id="xs-controllers-links-module-AuthModule-a01145e04a338b23378329421cab9df0b92848660cbb2497ab9b4b4430966a8d71d7d3ebaa7d70a5ba173de2d5a9a88805a6d186fc115d38a0d9807e6fb7fb28"' }>
                                            <li class="link">
                                                <a href="controllers/AuthController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AuthController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-AuthModule-a01145e04a338b23378329421cab9df0b92848660cbb2497ab9b4b4430966a8d71d7d3ebaa7d70a5ba173de2d5a9a88805a6d186fc115d38a0d9807e6fb7fb28"' : 'data-bs-target="#xs-injectables-links-module-AuthModule-a01145e04a338b23378329421cab9df0b92848660cbb2497ab9b4b4430966a8d71d7d3ebaa7d70a5ba173de2d5a9a88805a6d186fc115d38a0d9807e6fb7fb28"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-AuthModule-a01145e04a338b23378329421cab9df0b92848660cbb2497ab9b4b4430966a8d71d7d3ebaa7d70a5ba173de2d5a9a88805a6d186fc115d38a0d9807e6fb7fb28"' :
                                        'id="xs-injectables-links-module-AuthModule-a01145e04a338b23378329421cab9df0b92848660cbb2497ab9b4b4430966a8d71d7d3ebaa7d70a5ba173de2d5a9a88805a6d186fc115d38a0d9807e6fb7fb28"' }>
                                        <li class="link">
                                            <a href="injectables/AuthService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AuthService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/GithubStrategy.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >GithubStrategy</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/GoogleStrategy.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >GoogleStrategy</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/JwtAccessStrategy.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >JwtAccessStrategy</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/JwtRefreshStrategy.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >JwtRefreshStrategy</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/MailModule.html" data-type="entity-link" >MailModule</a>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-MailModule-8e87603df3808526269ad164fdab37f70dce93efff5620dce2c22a2919a0b2b3f891e97b98d4bdf6fe61ceb7c0f7082bf3c4a60601d2f81e500f0d1b825d619b"' : 'data-bs-target="#xs-injectables-links-module-MailModule-8e87603df3808526269ad164fdab37f70dce93efff5620dce2c22a2919a0b2b3f891e97b98d4bdf6fe61ceb7c0f7082bf3c4a60601d2f81e500f0d1b825d619b"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-MailModule-8e87603df3808526269ad164fdab37f70dce93efff5620dce2c22a2919a0b2b3f891e97b98d4bdf6fe61ceb7c0f7082bf3c4a60601d2f81e500f0d1b825d619b"' :
                                        'id="xs-injectables-links-module-MailModule-8e87603df3808526269ad164fdab37f70dce93efff5620dce2c22a2919a0b2b3f891e97b98d4bdf6fe61ceb7c0f7082bf3c4a60601d2f81e500f0d1b825d619b"' }>
                                        <li class="link">
                                            <a href="injectables/MailService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >MailService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/PrismaModule.html" data-type="entity-link" >PrismaModule</a>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-PrismaModule-7ec46d5213648d6af195ca52dfa87b1c4755e5bf4d88e606af4a6f96fffe160393eacdce8d2a5e5c86609ba2e65e54573d9bd60b03145287dbc37bed02a6aff4"' : 'data-bs-target="#xs-injectables-links-module-PrismaModule-7ec46d5213648d6af195ca52dfa87b1c4755e5bf4d88e606af4a6f96fffe160393eacdce8d2a5e5c86609ba2e65e54573d9bd60b03145287dbc37bed02a6aff4"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-PrismaModule-7ec46d5213648d6af195ca52dfa87b1c4755e5bf4d88e606af4a6f96fffe160393eacdce8d2a5e5c86609ba2e65e54573d9bd60b03145287dbc37bed02a6aff4"' :
                                        'id="xs-injectables-links-module-PrismaModule-7ec46d5213648d6af195ca52dfa87b1c4755e5bf4d88e606af4a6f96fffe160393eacdce8d2a5e5c86609ba2e65e54573d9bd60b03145287dbc37bed02a6aff4"' }>
                                        <li class="link">
                                            <a href="injectables/PrismaService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >PrismaService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/QueueModule.html" data-type="entity-link" >QueueModule</a>
                            </li>
                            <li class="link">
                                <a href="modules/UploadModule.html" data-type="entity-link" >UploadModule</a>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-UploadModule-82f139d5d53d0def2e4b2f4df7f562984b4c5f87102defef13203c7e292ed5679efc765584aa9870d2eeda68145ae3be9c53e2796191c8898f66ed0f87d1dd31"' : 'data-bs-target="#xs-injectables-links-module-UploadModule-82f139d5d53d0def2e4b2f4df7f562984b4c5f87102defef13203c7e292ed5679efc765584aa9870d2eeda68145ae3be9c53e2796191c8898f66ed0f87d1dd31"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-UploadModule-82f139d5d53d0def2e4b2f4df7f562984b4c5f87102defef13203c7e292ed5679efc765584aa9870d2eeda68145ae3be9c53e2796191c8898f66ed0f87d1dd31"' :
                                        'id="xs-injectables-links-module-UploadModule-82f139d5d53d0def2e4b2f4df7f562984b4c5f87102defef13203c7e292ed5679efc765584aa9870d2eeda68145ae3be9c53e2796191c8898f66ed0f87d1dd31"' }>
                                        <li class="link">
                                            <a href="injectables/UploadService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >UploadService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                </ul>
                </li>
                        <li class="chapter">
                            <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#controllers-links"' :
                                'data-bs-target="#xs-controllers-links"' }>
                                <span class="icon ion-md-swap"></span>
                                <span>Controllers</span>
                                <span class="icon ion-ios-arrow-down"></span>
                            </div>
                            <ul class="links collapse " ${ isNormalMode ? 'id="controllers-links"' : 'id="xs-controllers-links"' }>
                                <li class="link">
                                    <a href="controllers/AppController.html" data-type="entity-link" >AppController</a>
                                </li>
                                <li class="link">
                                    <a href="controllers/AuthController.html" data-type="entity-link" >AuthController</a>
                                </li>
                            </ul>
                        </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#classes-links"' :
                            'data-bs-target="#xs-classes-links"' }>
                            <span class="icon ion-ios-paper"></span>
                            <span>Classes</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="classes-links"' : 'id="xs-classes-links"' }>
                            <li class="link">
                                <a href="classes/AccountVerifyDto.html" data-type="entity-link" >AccountVerifyDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/ChangePasswordDto.html" data-type="entity-link" >ChangePasswordDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/ForgetPasswordDto.html" data-type="entity-link" >ForgetPasswordDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/GithubLoginDto.html" data-type="entity-link" >GithubLoginDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/GoogleLoginDto.html" data-type="entity-link" >GoogleLoginDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/LoginDto.html" data-type="entity-link" >LoginDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/LogoutDto.html" data-type="entity-link" >LogoutDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/MailProcessor.html" data-type="entity-link" >MailProcessor</a>
                            </li>
                            <li class="link">
                                <a href="classes/RefreshTokenDto.html" data-type="entity-link" >RefreshTokenDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/RegisterUserDto.html" data-type="entity-link" >RegisterUserDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/ResetPasswordDto.html" data-type="entity-link" >ResetPasswordDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/ResponseException.html" data-type="entity-link" >ResponseException</a>
                            </li>
                            <li class="link">
                                <a href="classes/ResponseInterceptor.html" data-type="entity-link" >ResponseInterceptor</a>
                            </li>
                            <li class="link">
                                <a href="classes/UpdateUserDto.html" data-type="entity-link" >UpdateUserDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/UploadProcessor.html" data-type="entity-link" >UploadProcessor</a>
                            </li>
                            <li class="link">
                                <a href="classes/Util.html" data-type="entity-link" >Util</a>
                            </li>
                        </ul>
                    </li>
                        <li class="chapter">
                            <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#injectables-links"' :
                                'data-bs-target="#xs-injectables-links"' }>
                                <span class="icon ion-md-arrow-round-down"></span>
                                <span>Injectables</span>
                                <span class="icon ion-ios-arrow-down"></span>
                            </div>
                            <ul class="links collapse " ${ isNormalMode ? 'id="injectables-links"' : 'id="xs-injectables-links"' }>
                                <li class="link">
                                    <a href="injectables/AuthService.html" data-type="entity-link" >AuthService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/GithubStrategy.html" data-type="entity-link" >GithubStrategy</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/GoogleStrategy.html" data-type="entity-link" >GoogleStrategy</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/JwtAccessStrategy.html" data-type="entity-link" >JwtAccessStrategy</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/JwtRefreshStrategy.html" data-type="entity-link" >JwtRefreshStrategy</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/MailService.html" data-type="entity-link" >MailService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/PrismaService.html" data-type="entity-link" >PrismaService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/UploadService.html" data-type="entity-link" >UploadService</a>
                                </li>
                            </ul>
                        </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#interfaces-links"' :
                            'data-bs-target="#xs-interfaces-links"' }>
                            <span class="icon ion-md-information-circle-outline"></span>
                            <span>Interfaces</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? ' id="interfaces-links"' : 'id="xs-interfaces-links"' }>
                            <li class="link">
                                <a href="interfaces/IJwtPayload.html" data-type="entity-link" >IJwtPayload</a>
                            </li>
                        </ul>
                    </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#miscellaneous-links"'
                            : 'data-bs-target="#xs-miscellaneous-links"' }>
                            <span class="icon ion-ios-cube"></span>
                            <span>Miscellaneous</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="miscellaneous-links"' : 'id="xs-miscellaneous-links"' }>
                            <li class="link">
                                <a href="miscellaneous/functions.html" data-type="entity-link">Functions</a>
                            </li>
                            <li class="link">
                                <a href="miscellaneous/typealiases.html" data-type="entity-link">Type aliases</a>
                            </li>
                        </ul>
                    </li>
                    <li class="chapter">
                        <a data-type="chapter-link" href="coverage.html"><span class="icon ion-ios-stats"></span>Documentation coverage</a>
                    </li>
                    <li class="divider"></li>
                    <li class="copyright">
                        Documentation generated using <a href="https://compodoc.app/" target="_blank" rel="noopener noreferrer">
                            <img data-src="images/compodoc-vectorise.png" class="img-responsive" data-type="compodoc-logo">
                        </a>
                    </li>
            </ul>
        </nav>
        `);
        this.innerHTML = tp.strings;
    }
});