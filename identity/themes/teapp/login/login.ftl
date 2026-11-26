<#import "template.ftl" as layout>
<@layout.registrationLayout displayMessage=!messagesPerField.existsError('username','password'); section>
  <#if section = "header">Inicia sesión
  <#elseif section = "form">
    <button type="button" class="teapp-back" onclick="history.back()" aria-label="Volver"><img src="${url.resourcesPath}/img/login-back.svg" alt="" /></button>
    <form id="kc-form-login" action="${url.loginAction}" method="post">
      <label for="username">Correo electrónico</label>
      <input id="username" name="username" type="email" autocomplete="username" required autofocus />
      <label for="password">Contraseña</label>
      <input id="password" name="password" type="password" autocomplete="current-password" required />
      <label class="show-password"><span>Mostrar contraseña </span><input type="checkbox" data-toggle-password="password" /><span class="password-toggle-art"><img class="toggle-outer" src="${url.resourcesPath}/img/password-outer.svg" alt="" /><img class="toggle-inner" src="${url.resourcesPath}/img/password-inner.svg" alt="" /></span></label>
      <#if messagesPerField.existsError('username','password')><p class="teapp-error" role="alert">${kcSanitize(messagesPerField.getFirstError('username','password'))?no_esc}</p></#if>
      <input type="hidden" name="credentialId" value="${(auth.selectedCredential!'')}" />
      <button class="teapp-primary" type="submit">Iniciar</button>
    </form>
    <#if realm.registrationAllowed && !registrationDisabled??>
      <p class="teapp-secondary">¿No tienes una cuenta? <a href="${url.registrationUrl}">Regístrate</a></p>
    </#if>
    <script src="${url.resourcesPath}/js/teapp.js" defer></script>
  </#if>
</@layout.registrationLayout>
