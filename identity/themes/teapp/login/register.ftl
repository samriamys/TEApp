<#import "template.ftl" as layout>
<@layout.registrationLayout displayMessage=true; section>
  <#if section = "header">Escribe tu nombre
  <#elseif section = "form">
    <form id="kc-register-form" data-role="${(register.formData.teappRole!'')}" data-hint="${(register.formData.email!'')}" action="${url.registrationAction}" method="post">
      <div class="teapp-step" data-step="0">
        <div id="registration-role">
        <h2>Escoge tu rol</h2>
        <div class="teapp-role-options">
          <label><input type="radio" name="teappRole" value="student" required /> Alumno</label>
          <label><input type="radio" name="teappRole" value="tutor" required /> Profesor</label>
        </div>
        </div>
        <label for="firstName">Nombre</label><input id="firstName" name="firstName" placeholder="Nombre" value="${(register.formData.firstName!'')}" autocomplete="given-name" required />
        <label for="lastName">Apellido paterno</label><input id="lastName" name="lastName" placeholder="Apellido paterno" value="${(register.formData.lastName!'')}" autocomplete="family-name" required />
        <label for="maternalLastName">Apellido materno</label><input id="maternalLastName" name="maternalLastName" placeholder="Apellido materno" value="${(register.formData.maternalLastName!'')}" />
      </div>
      <div class="teapp-step" data-step="1">
        <h2>Registra un correo</h2>
        <label for="email">Correo</label><input id="email" name="email" type="email" value="<#if !((register.formData.email!'')?starts_with('teapp:'))>${(register.formData.email!'')}</#if>" autocomplete="email" required />
      </div>
      <div class="teapp-step" data-step="2">
        <h2>Crea una contraseña</h2>
        <label for="password">Contraseña</label><input id="password" name="password" type="password" autocomplete="new-password" required />
        <label for="password-confirm">Confirmar contraseña</label><input id="password-confirm" name="password-confirm" type="password" autocomplete="new-password" required />
        <label class="show-password"><input type="checkbox" data-toggle-password="password,password-confirm" /> Mostrar contraseña</label>
        <div id="tutor-code-field"><label for="tutorCode">Código tutor</label><input id="tutorCode" name="tutorCode" value="${(register.formData.tutorCode!'')}" autocomplete="off" /></div>
      </div>
      <#if messagesPerField.existsError('firstName','lastName','email','password','password-confirm','teappRole','tutorCode')>
        <p class="teapp-error" role="alert">${kcSanitize(messagesPerField.getFirstError('firstName','lastName','email','password','password-confirm','teappRole','tutorCode'))?no_esc}</p>
      </#if>
      <div class="teapp-actions"><button id="step-back" type="button" hidden><img src="${url.resourcesPath}/img/back.svg" alt="" />Atrás</button><button id="step-next" class="teapp-primary" type="button" hidden>Siguiente<img src="${url.resourcesPath}/img/next.svg" alt="" /></button><button id="step-submit" class="teapp-primary" type="submit">Registrar</button></div>
    </form>
    <p class="teapp-secondary">¿Ya tienes una cuenta? <a href="${url.loginUrl}">Inicia aquí</a></p>
    <script src="${url.resourcesPath}/js/teapp.js" defer></script>
  </#if>
</@layout.registrationLayout>
