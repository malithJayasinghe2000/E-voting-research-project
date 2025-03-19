class Bottleneck(Module):
  __parameters__ = []
  __buffers__ = []
  training : bool
  _is_full_backward_hook : Optional[bool]
  cv1 : __torch__.models.common.___torch_mangle_122.Conv
  cv2 : __torch__.models.common.___torch_mangle_125.Conv
  def forward(self: __torch__.models.common.___torch_mangle_126.Bottleneck,
    argument_1: __torch__.torch.nn.modules.activation.___torch_mangle_191.SiLU,
    argument_2: Tensor) -> Tensor:
    cv2 = self.cv2
    cv1 = self.cv1
    _0 = (cv1).forward(argument_1, argument_2, )
    return (cv2).forward(argument_1, _0, )
