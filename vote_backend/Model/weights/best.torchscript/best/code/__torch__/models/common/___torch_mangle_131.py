class Conv(Module):
  __parameters__ = []
  __buffers__ = []
  training : bool
  _is_full_backward_hook : Optional[bool]
  conv : __torch__.torch.nn.modules.conv.___torch_mangle_129.Conv2d
  act : __torch__.torch.nn.modules.activation.___torch_mangle_130.SiLU
  def forward(self: __torch__.models.common.___torch_mangle_131.Conv,
    argument_1: __torch__.torch.nn.modules.activation.___torch_mangle_191.SiLU,
    argument_2: Tensor) -> Tensor:
    conv = self.conv
    _0 = (argument_1).forward39((conv).forward(argument_2, ), )
    return _0
